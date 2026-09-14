import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mutate, regenerate, saveVersion } from "@/lib/factory/store";
import {
  assetIssues,
  secretIssues,
  humanize,
  assertLiteralLocks,
} from "@/lib/factory/validation";
import { score } from "@/lib/factory/model";
import { body, fail } from "@/lib/factory/http";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const d = await body(req);
    if (secretIssues(JSON.stringify(d)).length)
      throw new Error("Remove credentials.");
    if (d.action === "regenerate")
      return NextResponse.json({ project: regenerate(id, d.assetId, d.revision) });
    const project = mutate(
      id,
      (p) => {
        if (d.revision !== undefined && p.revision !== d.revision)
          throw new Error("Workspace version changed. Reload and try again.");
        if (
          ["save", "approve", "reject", "lock", "restore", "humanize"].includes(
            d.action,
          )
        ) {
          const a = p.assets.find((a) => a.id === d.assetId);
          if (!a) throw new Error("Asset not found");
          if (d.action === "lock") {
            a.locked = !a.locked;
            return;
          }
          if (a.locked)
            throw new Error(
              "Locked asset: unlock before editing or reviewing.",
            );
          if (d.version !== undefined && d.version !== a.version)
            throw new Error("Asset version changed. Reload first.");
          if (d.action === "save") {
            if (typeof d.body !== "string" || d.body.length > 100000)
              throw new Error("Invalid asset body");
            assertLiteralLocks(p, a.body, d.body);
            saveVersion(a, d.body);
            a.owner = String(d.owner || "").slice(0, 200);
            a.nextAction = String(d.nextAction || "").slice(0, 1000);
          }
          if (d.action === "approve") {
            const issues = assetIssues(p, a);
            if (issues.length) throw new Error(issues.join(" "));
            a.status = "approved";
          }
          if (d.action === "reject") a.status = "rejected";
          if (d.action === "humanize") {
            const next = humanize(a.body);
            assertLiteralLocks(p, a.body, next);
            saveVersion(a, next);
          }
          if (d.action === "restore") {
            const v = a.history.find((v) => v.version === d.restoreVersion);
            if (!v) throw new Error("Version not found");
            saveVersion(a, v.body);
          }
        } else if (d.action === "source") {
          const s = p.sources.find((s) => s.id === d.sourceId);
          if (!s) throw new Error("Source not found");
          s.approved = !s.approved;
          if (!s.approved)
            for (const a of p.assets.filter((a) => a.sourceIds.includes(s.id)))
              a.status = "draft";
        } else if (d.action === "add-source") {
          if (!d.text?.trim() || d.text.length > 10000)
            throw new Error(
              "Source text is required (up to 10,000 characters).",
            );
          if (d.url && !/^https?:\/\//.test(d.url))
            throw new Error("Source URL must use HTTP or HTTPS.");
          p.sources.push({
            id: randomUUID(),
            title: String(d.title || "Operator source").slice(0, 200),
            text: d.text,
            url: String(d.url || ""),
            label: "user-provided",
            approved: false,
            capturedAt: new Date().toISOString(),
          });
        } else if (d.action === "fact") {
          const f = p.factLocks?.find((f) => f.id === d.factId);
          if (!f) throw new Error("Fact not found");
          f.locked = !f.locked;
          f.lockedBy = "Operator";
          f.lockedAt = new Date().toISOString();
        } else if (d.action === "select") {
          if (!p.opportunities?.some((o) => o.id === d.opportunityId))
            throw new Error("Opportunity not found");
          p.selectedOpportunityId = d.opportunityId;
          for (const a of p.assets) a.status = "draft";
        } else if (d.action === "score") {
          const o = p.opportunities?.find((o) => o.id === d.opportunityId);
          if (!o) throw new Error("Opportunity not found");
          o.compositeScore = score(d.values);
          o.dimensions.forEach((x, i) => (x.score = d.values[i]));
          p.opportunities!.sort(
            (a, b) => b.compositeScore - a.compositeScore,
          ).forEach((o, i) => (o.rank = i + 1));
        } else if (d.action === "task") {
          const t = p.tasks.find((t) => t.id === d.taskId);
          if (!t) throw new Error("Task not found");
          if (typeof d.done === "boolean") t.done = d.done;
          if (typeof d.owner === "string") t.owner = d.owner.slice(0, 200);
        } else if (d.action === "settings") {
          if (d.voice) {
            if (
              ![
                "Calm & consultative",
                "Warm & personable",
                "Concise & direct",
              ].includes(d.voice)
            )
              throw new Error("Invalid voice");
            p.voice = d.voice;
          }
          if (d.integrations) {
            if (
              !Array.isArray(d.integrations) ||
              d.integrations.some(
                (x: string) =>
                  ![
                    "Make",
                    "HubSpot",
                    "Google Drive",
                    "Google Docs",
                    "Notion",
                    "n8n",
                    "Zapier",
                  ].includes(x),
              )
            )
              throw new Error("Invalid integration");
            p.integrations = d.integrations;
          }
        } else if (d.action === "result") {
          for (const k of ["baseline", "current"])
            if (typeof d[k] !== "number" || !Number.isFinite(d[k]) || d[k] < 0)
              throw new Error("Use non-negative numeric measurements.");
          if (!d.metric?.trim() || !d.period?.trim() || !d.source?.trim())
            throw new Error(
              "Metric, comparable period and source are required.",
            );
          p.results.push({
            id: randomUUID(),
            metric: String(d.metric).slice(0, 200),
            baseline: d.baseline,
            current: d.current,
            unit: String(d.unit || "").slice(0, 50),
            period: String(d.period).slice(0, 300),
            source: String(d.source).slice(0, 1000),
            createdAt: new Date().toISOString(),
          });
        } else if (d.action === "run") {
          if (p.demo)
            throw new Error("Fictional demos do not count as client runs.");
          if (
            !d.evidence?.trim() ||
            !p.results.length ||
            !p.assets.every((a) => a.status === "approved") ||
            !p.tasks.filter((t) => t.phase === 30).every((t) => t.done)
          )
            throw new Error(
              "Complete 30-day QA, approve all assets, record measurements and provide client validation evidence.",
            );
          p.successfulRun = true;
          p.runEvidence = d.evidence;
        } else throw new Error("Unknown action");
      },
      String(d.action) + " " + String(d.assetId || ""),
    );
    return NextResponse.json({ project });
  } catch (e) {
    return fail(e);
  }
}
