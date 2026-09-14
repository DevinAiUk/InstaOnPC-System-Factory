import { z } from "zod";
import type { FactoryAsset, FactoryProject } from "./model";
export const intakeSchema = z.object({
  name: z.string().trim().min(2).max(150),
  url: z
    .string()
    .max(1000)
    .refine((v) => !v || /^https?:\/\//.test(v), "Use an http or https URL"),
  industry: z.string().trim().min(2).max(150),
  city: z.string().trim().min(2).max(150),
  serviceArea: z.string().max(500).default(""),
  services: z.array(z.string().trim().min(1).max(200)).min(1).max(30),
  primaryGoal: z.string().min(2).max(300),
  bookingTool: z.string().max(500).optional(),
  crm: z.string().max(500).optional(),
  communicationChannels: z.array(z.string()).max(20).default([]),
  painPoints: z.string().max(3000).default(""),
  complianceNotes: z.string().max(3000).optional(),
  pricingGuidance: z.string().max(2000).optional(),
  leadSources: z.string().max(1000).optional(),
  faqs: z.string().max(6000).optional(),
  address: z.string().max(500).optional(),
  street: z.string().max(500).optional(),
  phone: z.string().max(100).optional(),
  reviewScore: z.string().max(100).optional(),
  reviewSummary: z.string().max(3000).optional(),
  reviewSource: z.string().max(1000).optional(),
  socials: z.record(z.string().max(1000)).optional(),
  teamSize: z.string().optional(),
  businessHours: z.string().optional(),
});
export function secretIssues(text: string) {
  return /\b(sk-[a-zA-Z0-9_-]{12,}|gh[pousr]_[a-zA-Z0-9]{15,}|Bearer\s+[a-zA-Z0-9_.-]{15,})|(?:api[_ -]?key|password|secret)\s*[:=]\s*["']?[a-zA-Z0-9_-]{12,}/i.test(
    text,
  )
    ? ["Remove credentials; use a managed connection reference."]
    : [];
}
export function assetIssues(p: FactoryProject, a: FactoryAsset) {
  const issues = [...secretIssues(a.body)];
  if (!a.owner.trim()) issues.push("An owner is required.");
  if (!a.nextAction.trim()) issues.push("A next action is required.");
  const sentences = a.body
    .split(/[\n.!?]+/)
    .filter(
      (s) =>
        !/(?:no |never |not |without |do not |cannot |blocks? |prohibit|avoid|requires? |needs? )/i.test(
          s,
        ),
    );
  for (const s of sentences) {
    if (
      /\b(guarantee[ds]?|promise[ds]?)\b.{0,60}\b(rank|revenue|leads?|traffic|roi|savings?|citations?)\b|\bwill\b.{0,30}\b(double|triple|increase revenue|save you|rank|generate \d+ leads)\b/i.test(
        s,
      )
    )
      issues.push("Unsupported performance promise: revise before approval.");
    if (/\b(increased|improved|grew|saved|reduced)\b.{0,30}\d+\s*%/i.test(s))
      issues.push(
        "Performance claim needs explicit evidence review; use the baseline report instead.",
      );
  }
  if (
    ["content", "outreach"].includes(a.kind) &&
    !a.sourceIds.some((id) => p.sources.some((s) => s.id === id && s.approved))
  )
    issues.push("Approve a source and regenerate this asset before approval.");
  if (a.kind === "workflow") {
    try {
      const w = JSON.parse(a.body);
      if (w.active !== false || w.status !== "draft")
        issues.push("Workflow must remain inactive and draft.");
      if (
        !Array.isArray(w.fieldMap) ||
        w.fieldMap.length < 1 ||
        w.fieldMap.some(
          (m: { from?: string; to?: string }) =>
            !m.from?.trim() || !m.to?.trim(),
        )
      )
        issues.push("Complete every workflow field mapping.");
      for (const k of [
        "consent",
        "privacy",
        "disclosure",
        "humanHandoff",
        "humanApproval",
        "errorHandling",
        "testCases",
        "monitoring",
      ])
        if (!w[k] || (Array.isArray(w[k]) && !w[k].length))
          issues.push("Missing workflow control: " + k);
    } catch {
      issues.push("Workflow must be valid JSON.");
    }
  }
  return [...new Set(issues)];
}
export function humanize(body: string) {
  return body
    .replace(/\butilize\b/g, "use")
    .replace(/\bin order to\b/g, "to")
    .replace(/\bat this point in time\b/g, "now");
}

export function assertLiteralLocks(
  p: FactoryProject,
  before: string,
  after: string,
) {
  for (const f of p.factLocks || []) {
    if (!f.locked) continue;
    const raw = p.businessProfile?.[f.field as keyof typeof p.businessProfile];
    const values = Array.isArray(raw) ? raw.map(String) : [String(raw || "")];
    for (const value of values) {
      if (value && before.includes(value) && !after.includes(value))
        throw new Error(
          `Locked fact changed in draft: ${f.field}. Unlock the fact before changing its value.`,
        );
    }
  }
}
