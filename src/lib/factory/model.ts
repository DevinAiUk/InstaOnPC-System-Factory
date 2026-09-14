import type { Project, ApprovalStatus, EvidenceLabel } from "../types";
export interface AssetVersion {
  version: number;
  body: string;
  savedAt: string;
  status: ApprovalStatus;
}
export interface FactoryAsset {
  id: string;
  name: string;
  kind:
    "skill" | "offer" | "workflow" | "outreach" | "content" | "sop" | "report";
  body: string;
  version: number;
  status: ApprovalStatus;
  owner: string;
  nextAction: string;
  locked: boolean;
  history: AssetVersion[];
  sourceIds: string[];
}
export interface Source {
  id: string;
  title: string;
  url: string;
  text: string;
  label: EvidenceLabel;
  approved: boolean;
  capturedAt: string;
}
export interface Task {
  id: string;
  phase: 30 | 60 | 90;
  title: string;
  owner: string;
  done: boolean;
}
export interface Result {
  id: string;
  metric: string;
  baseline: number;
  current: number;
  unit: string;
  period: string;
  source: string;
  createdAt: string;
}
export interface FactoryProject extends Project {
  assets: FactoryAsset[];
  sources: Source[];
  tasks: Task[];
  results: Result[];
  voice: string;
  demo: boolean;
  revision: number;
  successfulRun: boolean;
  runEvidence?: string;
  integrations: string[];
}
export const SKILLS = [
  [
    "01-opportunity-mapper",
    "Opportunity mapper",
    "Pick the niche, core bottleneck, conversion event, and outcome-led offer.",
    "offer brief, ICP, pain map, buying triggers",
  ],
  [
    "02-prospect-audit-generator",
    "Prospect audit generator",
    "Create an evidence-led funnel diagnosis, a 90-second Loom script, and calm outreach.",
    "five-point audit, Loom script, outreach draft",
  ],
  [
    "03-ai-lead-system-architect",
    "AI lead system architect",
    "Map website, chatbot, voice, SEO, CRM, booking, human routing, and staged implementation.",
    "component map, dependencies, acceptance criteria",
  ],
  [
    "04-knowledge-base-builder",
    "Knowledge base builder",
    "Structure approved services, pricing guidance, FAQs, policies, objections, and human handoff.",
    "Markdown FAQ and JSON knowledge base",
  ],
  [
    "05-content-humanizer",
    "Content humanizer",
    "Refine rhythm and clarity while preserving claims, pricing, keywords, names, qualifiers, and attribution.",
    "revised draft and preservation ledger",
  ],
  [
    "06-geo-aeo-content-writer",
    "GEO / AEO content writer",
    "Create useful service and city pages, answers, FAQs, and CTAs from approved sources.",
    "service-page draft, FAQ blocks, channel adaptations",
  ],
  [
    "07-automation-implementation-brief",
    "Automation implementation brief",
    "Create a Make-ready specification with deterministic validation, field maps, approvals, and bounded recovery.",
    "trigger/action plan, field map, test cases, monitoring",
  ],
  [
    "08-client-performance-reporter",
    "Client performance reporter",
    "Compare measured results with a defined baseline and propose the next practical test.",
    "KPI narrative, limitations, next action and owner",
  ],
] as const;
export const WEIGHTS = [0.25, 0.2, 0.15, 0.15, 0.15, 0.1];
export const DIMENSIONS = [
  "Urgency",
  "Financial value",
  "Implementation feasibility",
  "Staff readiness",
  "Defensibility & compliance",
  "Evidence quality",
];
export function score(values: number[]) {
  if (
    values.length !== 6 ||
    values.some((v) => !Number.isFinite(v) || v < 0 || v > 100)
  )
    throw new Error("Six scores between 0 and 100 are required.");
  return (
    Math.round(values.reduce((sum, v, i) => sum + v * WEIGHTS[i], 0) * 100) /
    100
  );
}
export function completion(p: FactoryProject) {
  const checks = [
    !!p.businessProfile?.services.length,
    !!p.opportunities?.length,
    !!p.selectedOpportunityId,
    p.sources.some((s) => s.approved),
    p.assets.some((a) => a.status === "approved"),
    p.results.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
