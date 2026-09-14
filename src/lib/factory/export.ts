import JSZip from "jszip";
import { createHash } from "node:crypto";
import { getProject, mutate } from "./store";
import { shared, workflow } from "./generate";
import type { FactoryProject } from "./model";
import { secretIssues } from "./validation";
export function csv(rows: unknown[][]) {
  return rows
    .map((r) =>
      r
        .map((v) => {
          let s = String(v ?? "");
          if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
          return '"' + s.replaceAll('"', '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
}
export function packageFiles(p: FactoryProject) {
  const files: Record<string, string> = {};
  for (const a of p.assets) {
    const root =
      a.kind === "skill"
        ? "skills"
        : a.kind === "workflow"
          ? "automation"
          : a.kind === "report"
            ? "baseline"
            : "documentation";
    files[
      `${root}/${a.id}${a.kind === "skill" ? "/SKILL.md" : a.kind === "workflow" || a.id === "knowledge-base" ? ".json" : ".md"}`
    ] = a.body;
  }
  for (const [name, body] of Object.entries(shared))
    files["skills/_shared/" + name] = body;
  files["skills/_shared/fact-locks.json"] = JSON.stringify(
    p.factLocks,
    null,
    2,
  );
  files["workspace/project.json"] = JSON.stringify(p, null, 2);
  files["workspace/atom-ledger.json"] = JSON.stringify(
    p.assets
      .filter((a) => a.kind === "content")
      .map((a) => ({
        id: a.id,
        sourceIds: a.sourceIds,
        sourceLocations: a.sourceIds.map(
          (id) => p.sources.find((s) => s.id === id)?.url || "intake",
        ),
        text: a.body,
        targetChannel: "service-page",
        status: a.status,
        dedupeKey: createHash("sha256").update(a.body).digest("hex"),
      })),
    null,
    2,
  );
  files["baseline/sources.json"] = JSON.stringify(p.sources, null, 2);
  files["baseline/results.csv"] = csv([
    ["Metric", "Baseline", "Current", "Unit", "Period", "Source"],
    ...p.results.map((r) => [
      r.metric,
      r.baseline,
      r.current,
      r.unit,
      r.period,
      r.source,
    ]),
  ]);
  files["documentation/roadmap.csv"] = csv([
    ["Phase", "Task", "Owner", "Complete"],
    ...p.tasks.map((t) => [t.phase, t.title, t.owner, t.done]),
  ]);
  files["portfolio/evidence-plan.md"] =
    "# Portfolio evidence plan\nNo measured outcomes are claimed. Obtain client permission before sharing. Store baseline and comparable-period measurements; label hypotheses.";
  for (const adapter of ["make", "n8n", "zapier"])
    files[`automation/${adapter}-implementation-spec.json`] = JSON.stringify(
      {
        adapter,
        ...workflow(p),
        notice:
          "Implementation specification, not a native executable/importable blueprint. Validate current module identifiers and managed connections in the target tool.",
      },
      null,
      2,
    );
  files["exports/drive-folder-manifest.json"] = JSON.stringify(
    {
      status: "draft",
      delivered: false,
      folders: [
        "skills",
        "workspace",
        "automation",
        "baseline",
        "documentation",
        "portfolio",
        "exports",
      ],
      files: Object.keys(files),
    },
    null,
    2,
  );
  files["README.md"] =
    `# ${p.name} · Local Lead Engine\nDraft delivery package. Review sources → diagnosis → offer → skills → workflow → content → implementation → baseline report. Files downloaded locally; no Drive upload, outreach, publishing, booking or activation occurred. Native connectors are mock adapters. Owner: Operator. Next action: review and validate with the client.`;
  files["manifest.json"] = JSON.stringify(
    {
      name: p.name,
      version: "1.0.0",
      schemaVersion: "1.0",
      projectId: p.id,
      demo: p.demo,
      draftOnly: true,
      active: false,
      generatedAt: new Date().toISOString(),
      pipeline: p.assets.filter((a) => a.kind === "skill").map((a) => a.id),
      files: Object.keys(files),
    },
    null,
    2,
  );
  if (secretIssues(JSON.stringify(files)).length)
    throw new Error("Export blocked: remove credentials.");
  files["SHA256SUMS.txt"] = Object.entries(files)
    .map(
      ([name, body]) =>
        createHash("sha256").update(body).digest("hex") + "  " + name,
    )
    .join("\n");
  return files;
}
export async function zipBundle(p: FactoryProject) {
  const zip = new JSZip();
  for (const [name, body] of Object.entries(packageFiles(p)))
    zip.file(name, body);
  return zip.generateAsync({ type: "nodebuffer" });
}
export function generateExport(id: string) {
  const p = getProject(id);
  if (!p) return null;
  const names = Object.keys(packageFiles(p));
  const pkg = {
    id: "export_" + Date.now(),
    projectId: id,
    status: "ready" as const,
    exportedAt: new Date().toISOString(),
    tiers: (
      [
        "/skills",
        "/workspace",
        "/automation",
        "/baseline",
        "/documentation",
        "/portfolio",
        "/exports",
      ] as const
    ).map((name) => ({
      name,
      files: names
        .filter((f) => f.startsWith(name.slice(1) + "/"))
        .map((filename) => ({
          filename,
          description: "Draft artifact",
          status: "ready" as const,
        })),
    })),
  };
  mutate(
    id,
    (p) => {
      p.exportPackage = pkg;
    },
    "Prepared draft export",
  );
  return pkg;
}
