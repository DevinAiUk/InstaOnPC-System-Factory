import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import type { Project } from "../types";
import type { FactoryProject } from "./model";
import { makeAssets, recommendations } from "./generate";
import { assetIssues } from "./validation";
import * as file from "./store";
import { SEED_PROJECTS } from "../mock-data/seed";

const now = () => new Date().toISOString();
const postgresEnabled = () => Boolean(process.env.DATABASE_URL);

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

let initialized: Promise<void> | undefined;
function ensurePostgres() {
  if (!initialized) {
    initialized = (async () => {
      const sql = client();
      await sql`
        CREATE TABLE IF NOT EXISTS workspace_projects (
          id text PRIMARY KEY,
          organization_id text NOT NULL DEFAULT 'single-operator',
          name text NOT NULL,
          industry text NOT NULL DEFAULT '',
          city text NOT NULL DEFAULT '',
          status text NOT NULL,
          revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
          payload jsonb NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
    })().catch((error) => {
      initialized = undefined;
      throw error;
    });
  }
  return initialized;
}

async function seedPostgres() {
  const sql = client();
  // Seed directly from in-memory fixtures. Never touch the deployment
  // filesystem when Postgres is active (serverless files are not durable).
  const seeds = SEED_PROJECTS.map((project) => file.hydrate(project, true));
  for (const project of seeds) {
    await sql`
      INSERT INTO workspace_projects
        (id, name, industry, city, status, revision, payload, created_at, updated_at)
      VALUES
        (${project.id}, ${project.name}, ${project.businessProfile?.industry ?? ""},
         ${project.businessProfile?.city ?? ""}, ${project.status}, ${project.revision},
         ${JSON.stringify(project)}::jsonb, ${project.createdAt}, ${project.updatedAt})
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

export async function getProjects(): Promise<FactoryProject[]> {
  if (!postgresEnabled()) return file.getProjects();
  await ensurePostgres();
  const sql = client();
  let rows = await sql`SELECT payload FROM workspace_projects ORDER BY updated_at DESC`;
  if (!rows.length) {
    await seedPostgres();
    rows = await sql`SELECT payload FROM workspace_projects ORDER BY updated_at DESC`;
  }
  return rows.map((row) => row.payload as FactoryProject);
}

export async function getProject(id: string) {
  if (!postgresEnabled()) return file.getProject(id);
  await ensurePostgres();
  const sql = client();
  const rows = await sql`SELECT payload FROM workspace_projects WHERE id = ${id} LIMIT 1`;
  return rows[0]?.payload as FactoryProject | undefined;
}

export async function mutate(
  id: string,
  change: (project: FactoryProject) => void,
  action = "Project updated",
) {
  if (!postgresEnabled()) return file.mutate(id, change, action);
  const project = await getProject(id);
  if (!project) throw new Error("Project not found");
  const expectedRevision = project.revision;
  change(project);
  project.revision = expectedRevision + 1;
  project.updatedAt = now();
  project.auditLog = [{
    id: randomUUID(), projectId: id, action, target: id,
    performedBy: "Operator", timestamp: now(),
  }, ...(project.auditLog || [])].slice(0, 1000);
  const sql = client();
  const rows = await sql`
    UPDATE workspace_projects
       SET name = ${project.name},
           industry = ${project.businessProfile?.industry ?? ""},
           city = ${project.businessProfile?.city ?? ""},
           status = ${project.status},
           revision = ${project.revision},
           payload = ${JSON.stringify(project)}::jsonb,
           updated_at = ${project.updatedAt}
     WHERE id = ${id} AND revision = ${expectedRevision}
     RETURNING id
  `;
  if (!rows.length) throw new Error("Workspace version changed. Reload and try again.");
  return project;
}

export async function createProject(data: Partial<Project>) {
  if (!postgresEnabled()) return file.createProject(data);
  await ensurePostgres();
  const id = "proj_" + randomUUID().slice(0, 8);
  const profile = data.businessProfile!;
  const project = file.hydrate({
    id, name: profile.name, status: "building", createdAt: now(), updatedAt: now(),
    businessProfile: { ...profile, id: "bp_" + id, projectId: id },
  });
  const sql = client();
  await sql`
    INSERT INTO workspace_projects
      (id, name, industry, city, status, revision, payload, created_at, updated_at)
    VALUES (${id}, ${project.name}, ${profile.industry}, ${profile.city}, ${project.status},
      ${project.revision}, ${JSON.stringify(project)}::jsonb, ${project.createdAt}, ${project.updatedAt})
  `;
  return project;
}

export async function updateProject(id: string, data: Partial<Project>) {
  return mutate(id, (project) => {
    if (data.businessProfile) {
      for (const fact of project.factLocks || []) {
        if (fact.locked && JSON.stringify(data.businessProfile[fact.field as keyof typeof data.businessProfile]) !==
          JSON.stringify(project.businessProfile![fact.field as keyof typeof project.businessProfile]))
          throw new Error(`Locked fact: ${fact.field}`);
      }
      project.businessProfile = { ...project.businessProfile, ...data.businessProfile };
      project.name = project.businessProfile.name;
      project.sources.forEach((source) => { source.approved = false; });
      project.sources.push({ id: randomUUID(), title: "Updated business intake", url: "",
        text: `${project.name} provides ${project.businessProfile.services.join(", ")} in ${project.businessProfile.city}. Objective: ${project.businessProfile.primaryGoal}. ${project.businessProfile.painPoints}`,
        label: "user-provided", approved: false, capturedAt: now() });
      project.assets.forEach((asset) => { asset.status = "draft"; });
    }
    if (data.selectedOpportunityId) project.selectedOpportunityId = data.selectedOpportunityId;
  });
}

export async function deleteProject(id: string) {
  if (!postgresEnabled()) return file.deleteProject(id);
  await ensurePostgres();
  const sql = client();
  const rows = await sql`DELETE FROM workspace_projects WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getAuditLog(id?: string) {
  return (await getProjects()).filter((p) => !id || p.id === id)
    .flatMap((p) => p.auditLog || []).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export const saveVersion = file.saveVersion;

export async function regenerate(id: string, assetId?: string, revision?: number) {
  return mutate(id, (p) => {
    if (revision !== undefined && p.revision !== revision) throw new Error("Workspace version changed. Reload and try again.");
    const drafts = makeAssets(p);
    for (const asset of p.assets) if ((!assetId || asset.id === assetId) && !asset.locked) {
      const next = drafts.find((candidate) => candidate.id === asset.id);
      if (next) { file.saveVersion(asset, next.body); asset.sourceIds = next.sourceIds; }
    }
    p.status = "reviewing";
  }, assetId ? `Regenerated ${assetId}` : "Generated factory assets");
}

export async function generateAnalysis(id: string) {
  const p = await mutate(id, (project) => {
    project.businessProfile!.summary = `${project.name} · ${project.businessProfile!.industry} in ${project.businessProfile!.city}. Intake-based draft; public research requires an explicit scan.`;
    project.status = "auditing";
  });
  return p.businessProfile;
}

export async function generateAudit(id: string) {
  const p = await mutate(id, (project) => { project.status = "scoring"; });
  return p.revenueLeaks;
}

export async function generateScore(id: string) {
  const p = await mutate(id, (project) => { project.opportunities = recommendations(project); project.status = "building"; });
  return p.opportunities;
}

export async function lockFact(id: string, factId: string) {
  await mutate(id, (p) => { const fact = p.factLocks?.find((f) => f.id === factId); if (!fact) throw new Error("Unknown fact"); fact.locked = true; fact.lockedAt = now(); fact.lockedBy = "Operator"; });
  return true;
}

export async function unlockFact(id: string, factId: string) {
  await mutate(id, (p) => { const fact = p.factLocks?.find((f) => f.id === factId); if (!fact) throw new Error("Unknown fact"); fact.locked = false; });
  return true;
}

export async function approveOffer(id: string) {
  await mutate(id, (p) => { const asset = p.assets.find((a) => a.id === "offer")!; if (assetIssues(p, asset).length) throw new Error("Resolve QA issues first"); asset.status = "approved"; });
  return true;
}

export async function rejectOffer(id: string, reason: string) {
  await mutate(id, (p) => { p.assets.find((a) => a.id === "offer")!.status = "rejected"; }, `Offer rejected: ${reason}`);
  return true;
}

export async function generateExport(id: string) {
  const { packageFiles } = await import("./export");
  const project = await getProject(id);
  if (!project) return null;
  const names = Object.keys(packageFiles(project));
  const pkg = { id: "export_" + Date.now(), projectId: id, status: "ready" as const,
    exportedAt: now(), tiers: (["/skills", "/workspace", "/automation", "/baseline", "/documentation", "/portfolio", "/exports"] as const)
      .map((name) => ({ name, files: names.filter((item) => item.startsWith(name.slice(1) + "/"))
        .map((filename) => ({ filename, description: "Draft artifact", status: "ready" as const })) })) };
  await mutate(id, (p) => { p.exportPackage = pkg; }, "Prepared draft export");
  return pkg;
}
