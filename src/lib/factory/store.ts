import { additionalAssets } from "./enrich";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { SEED_PROJECTS } from "../mock-data/seed";
import type { FactoryProject, FactoryAsset } from "./model";
import { makeAssets, recommendations } from "./generate";
import type { Project } from "../types";
export function dataFile() {
  return (
    process.env.FACTORY_DATA_PATH ||
    path.join(process.cwd(), ".factory-data", "workspace.json")
  );
}
const now = () => new Date().toISOString();
export function hydrate(input: Project, demo = false): FactoryProject {
  const p: FactoryProject = {
    ...structuredClone(input),
    sources: [],
    assets: [],
    tasks: [],
    results: [],
    voice: "Calm & consultative",
    demo,
    revision: 1,
    successfulRun: false,
    integrations: ["Make", "HubSpot", "Google Drive"],
  };
  const b = p.businessProfile!;
  if (demo) {
    b.url = `https://${p.id.replace("_", "-")}.example`;
    p.revenueLeaks = p.revenueLeaks?.map((l) => ({
      ...l,
      evidenceLabel: "inferred",
      evidence: "Fictional demo scenario — not live research.",
    }));
  }
  p.sources = [
    {
      id: randomUUID(),
      title: demo ? "Demo intake · fictional business" : "Business intake",
      url: "",
      text: `${b.name} provides ${b.services.join(", ")} in ${b.city}. Objective: ${b.primaryGoal}. ${b.painPoints}`,
      label: "user-provided",
      approved: false,
      capturedAt: now(),
    },
  ];
  p.opportunities = recommendations(p);
  p.selectedOpportunityId = p.opportunities[0].id;
  p.assets = makeAssets(p);
  p.factLocks = [
    "name",
    "city",
    "services",
    "pricingGuidance",
    "phone",
    "address",
    "businessHours",
    "serviceArea",
    "url",
  ].map((field) => ({
    id: randomUUID(),
    projectId: p.id,
    field,
    value: String(b[field as keyof typeof b] || ""),
    locked: false,
  }));
  p.tasks = ([30, 60, 90] as const).flatMap((phase) =>
    (phase === 30
      ? [
          "Confirm intake and proof",
          "Record two-week baseline",
          "Test intake and human handoff",
        ]
      : phase === 60
        ? [
            "Review owner routing",
            "Test local service-page draft",
            "Review consent and failure logs",
          ]
        : [
            "Compare baseline and current period",
            "Review client results",
            "Choose next measured experiment",
          ]
    ).map((title) => ({
      id: randomUUID(),
      phase,
      title,
      owner: "Operator",
      done: false,
    })),
  );
  return p;
}
function read(): FactoryProject[] {
  const file = dataFile();
  if (!fs.existsSync(file)) {
    const seeds = SEED_PROJECTS.map((p) => hydrate(p, true));
    write(seeds);
    return seeds;
  }
  const projects: FactoryProject[] = JSON.parse(fs.readFileSync(file, "utf8"));
  let changed = false;
  for (const p of projects) {
    if (!p.assets.some((a) => a.id === "knowledge-base")) {
      p.assets.push(...additionalAssets(p));
      changed = true;
    }
  }
  if (changed) write(projects);
  return projects;
}
function write(projects: FactoryProject[]) {
  const file = dataFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = file + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(projects, null, 2), { mode: 0o600 });
  fs.renameSync(temp, file);
}
export function getProjects() {
  return read();
}
export function getProject(id: string) {
  return read().find((p) => p.id === id);
}
export function mutate(
  id: string,
  fn: (p: FactoryProject) => void,
  action = "Project updated",
) {
  const all = read();
  const p = all.find((p) => p.id === id);
  if (!p) throw new Error("Project not found");
  fn(p);
  p.revision++;
  p.updatedAt = now();
  p.auditLog = [
    {
      id: randomUUID(),
      projectId: id,
      action,
      target: id,
      performedBy: "Operator",
      timestamp: now(),
    },
    ...(p.auditLog || []),
  ].slice(0, 1000);
  write(all);
  return p;
}
export function createProject(data: Partial<Project>) {
  const id = "proj_" + randomUUID().slice(0, 8);
  const b = data.businessProfile!;
  const p = hydrate({
    id,
    name: b.name,
    status: "building",
    createdAt: now(),
    updatedAt: now(),
    businessProfile: { ...b, id: "bp_" + id, projectId: id },
  });
  write([p, ...read()]);
  return p;
}
export function updateProject(id: string, data: Partial<Project>) {
  return mutate(id, (p) => {
    if (data.businessProfile) {
      for (const f of p.factLocks || []) {
        if (
          f.locked &&
          JSON.stringify(
            data.businessProfile[f.field as keyof typeof data.businessProfile],
          ) !==
            JSON.stringify(
              p.businessProfile![f.field as keyof typeof p.businessProfile],
            )
        )
          throw new Error(`Locked fact: ${f.field}`);
      }
      p.businessProfile = { ...p.businessProfile, ...data.businessProfile };
      p.name = p.businessProfile.name;
      for (const source of p.sources) source.approved = false;
      p.sources.push({id:randomUUID(),title:'Updated business intake',url:'',text:`${p.name} provides ${p.businessProfile.services.join(', ')} in ${p.businessProfile.city}. Objective: ${p.businessProfile.primaryGoal}. ${p.businessProfile.painPoints}`,label:'user-provided',approved:false,capturedAt:now()});
      for (const f of p.factLocks || []) if (!f.locked) f.value = String(p.businessProfile[f.field as keyof typeof p.businessProfile] || '');
      for (const a of p.assets) a.status = "draft";
    }
    if (data.selectedOpportunityId) {
      if (!p.opportunities?.some((o) => o.id === data.selectedOpportunityId))
        throw new Error("Unknown opportunity");
      p.selectedOpportunityId = data.selectedOpportunityId;
      for (const a of p.assets) a.status = "draft";
    }
  });
}
export function deleteProject(id: string) {
  const all = read();
  if (!all.some((p) => p.id === id)) return false;
  write(all.filter((p) => p.id !== id));
  return true;
}
export function getAuditLog(id?: string) {
  return read()
    .filter((p) => !id || p.id === id)
    .flatMap((p) => p.auditLog || [])
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
export function lockFact(id: string, factId: string) {
  mutate(id, (p) => {
    const f = p.factLocks?.find((f) => f.id === factId);
    if (!f) throw new Error("Unknown fact");
    f.locked = true;
    f.lockedAt = now();
    f.lockedBy = "Operator";
  });
  return true;
}
export function unlockFact(id: string, factId: string) {
  mutate(id, (p) => {
    const f = p.factLocks?.find((f) => f.id === factId);
    if (!f) throw new Error("Unknown fact");
    f.locked = false;
  });
  return true;
}
export function saveVersion(a: FactoryAsset, body: string) {
  a.history.unshift({
    version: a.version,
    body: a.body,
    savedAt: now(),
    status: a.status,
  });
  a.history = a.history.slice(0, 30);
  a.body = body;
  a.version++;
  if(a.kind === 'skill') a.body = a.body.replace(/(## Version and updated date\n)[^\n]+/, `$1${a.version}.0.0 · ${now().slice(0,10)}`);
  a.status = "draft";
}
export function regenerate(id: string, assetId?: string, expectedRevision?: number) {
  return mutate(
    id,
    (p) => {
      if (expectedRevision !== undefined && p.revision !== expectedRevision) throw new Error("Workspace version changed. Reload and try again.");
      const drafts = makeAssets(p);
      for (const a of p.assets) {
        if ((!assetId || a.id === assetId) && !a.locked) {
          const next = drafts.find((d) => d.id === a.id);
          if (next) {
            saveVersion(a, next.body);
            a.sourceIds = next.sourceIds;
          }
        }
      }
      p.status = "reviewing";
    },
    assetId ? `Regenerated ${assetId}` : "Generated factory assets",
  );
}
export function generateAnalysis(id: string) {
  return mutate(id, (p) => {
    p.businessProfile!.summary = `${p.name} · ${p.businessProfile!.industry} in ${p.businessProfile!.city}. Intake-based draft; public research requires an explicit scan.`;
    p.status = "auditing";
  }).businessProfile;
}
export function generateAudit(id: string) {
  return mutate(id, (p) => {
    p.revenueLeaks = ["response", "conversion", "handoff"].map(
      (category, i) => ({
        id: `${id}-leak-${i}`,
        projectId: id,
        category: category as "response" | "conversion" | "handoff",
        observation:
          i === 0
            ? p.businessProfile!.painPoints || "Confirm response process"
            : "Review " + category + " process",
        evidence:
          "Intake and operator hypotheses; verify against source evidence.",
        evidenceLabel: "inferred",
        severity: i === 0 ? "high" : "medium",
        recommendedAction: "Trace one inquiry through this stage.",
        requiredHumanInput: "Confirm actual process and baseline",
      }),
    );
    p.status = "scoring";
  }).revenueLeaks;
}
export function generateScore(id: string) {
  return mutate(id, (p) => {
    p.opportunities = recommendations(p);
    p.status = "building";
  }).opportunities;
}
export function approveOffer(id: string) {
  mutate(id, (p) => {
    const a = p.assets.find((a) => a.id === "offer")!;
    if (assetIssues(p, a).length) throw new Error("Resolve QA issues first");
    a.status = "approved";
  });
  return true;
}
export function rejectOffer(id: string, reason: string) {
  mutate(
    id,
    (p) => {
      p.assets.find((a) => a.id === "offer")!.status = "rejected";
    },
    "Offer rejected: " + reason,
  );
  return true;
}
import { assetIssues } from "./validation";
