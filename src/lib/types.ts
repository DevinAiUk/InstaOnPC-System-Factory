// InstaOnPC System Factory — Core Type Definitions

export type EvidenceLabel = 'sourced' | 'user-provided' | 'inferred' | 'recommendation' | 'needs-review';
export type Severity = 'low' | 'medium' | 'high';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type ProjectStatus = 'intake' | 'analyzing' | 'auditing' | 'scoring' | 'building' | 'reviewing' | 'ready' | 'exported';

export interface EvidenceItem {
  id: string;
  label: EvidenceLabel;
  claim: string;
  source?: string;
  notes?: string;
}

export interface FactLock {
  id: string;
  projectId: string;
  field: string;
  value: string;
  locked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  approvedBy?: string;
}

export interface BusinessProfile {
  id: string;
  projectId: string;
  name: string;
  url: string;
  industry: string;
  city: string;
  serviceArea: string;
  services: string[];
  primaryGoal: string;
  bookingTool?: string;
  crm?: string;
  communicationChannels: string[];
  teamSize?: string;
  businessHours?: string;
  painPoints: string;
  complianceNotes?: string;
  pricingGuidance?: string;
  leadSources?: string;
  faqs?: string;
  address?: string;
  street?: string;
  phone?: string;
  reviewScore?: string;
  reviewSummary?: string;
  reviewSource?: string;
  socials?: Record<string, string>;
  // Intelligence Brief
  summary?: string;
  audienceDescription?: string;
  conversionObservations?: EvidenceItem[];
  faqInventory?: EvidenceItem[];
  existingCTAs?: EvidenceItem[];
  bookingPathways?: EvidenceItem[];
  publicProof?: EvidenceItem[];
  missingInfo?: string[];
}

export interface RevenueLeak {
  id: string;
  projectId: string;
  category: 'discovery' | 'conversion' | 'response' | 'follow-up' | 'trust' | 'handoff';
  observation: string;
  evidence: string;
  evidenceLabel: EvidenceLabel;
  severity: Severity;
  recommendedAction: string;
  requiredHumanInput: string;
  risk?: string;
  dependency?: string;
}

export interface OpportunityDimension {
  name: string;
  score: number;
  weight: number;
  rationale: string;
}

export interface Opportunity {
  id: string;
  projectId: string;
  rank: number;
  name: string;
  problem: string;
  whySelected: string;
  compositeScore: number;
  dimensions: OpportunityDimension[];
  requiredInputs: string[];
  requiredComponents: string[];
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  risks: string[];
  humanReviewPoints: string[];
  measurementDefinition: string;
  suggestedFirstAction: string;
  selected?: boolean;
}

export interface Offer {
  id: string;
  projectId: string;
  version: number;
  status: ApprovalStatus;
  buyer: string;
  businessProblem: string;
  proposedSystem: string;
  scope: string[];
  exclusions: string[];
  clientResponsibilities: string[];
  implementationAssumptions: string[];
  pricingLogic: string;
  optionalUpgrades: string[];
  approvalRequirements: string[];
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface WorkflowModule {
  id: string;
  name: string;
  trigger: string;
  inputs: string[];
  questions: { q: string; logic: string }[];
  leadFields: string[];
  routingRules: string[];
  humanHandoffTriggers: string[];
  consentLanguage?: string;
  errorHandling: string;
  loggingRequirements: string;
  testCases: string[];
  monitoringPlan: string;
}

export interface SkillFile {
  id: string;
  projectId: string;
  skillName: string;
  purpose: string;
  whenToUse: string;
  requiredInputs: string[];
  workflowSteps: string[];
  decisionRules: string[];
  outputFormat: string;
  validationChecklist: string[];
  risksAndEscalation: string[];
  handoffToNext: string;
  exampleOutput: string;
  version: string;
  lastUpdated: string;
  status: ApprovalStatus;
}

export interface ContentAsset {
  id: string;
  projectId: string;
  type: 'email' | 'linkedin' | 'followup' | 'discovery-agenda' | 'proposal-outline' | 'roadmap-task' | 'kpi-baseline';
  title: string;
  body: string;
  status: ApprovalStatus;
  version: number;
  evidenceLabel?: EvidenceLabel;
  notes?: string;
}

export interface KPIBaseline {
  id: string;
  projectId: string;
  metric: string;
  currentValue?: string;
  measurementMethod: string;
  dataLimitations: string;
  nextReviewDate: string;
  reportingCadence: string;
}

export interface AuditLogEntry {
  id: string;
  projectId?: string;
  action: string;
  target: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface ExportPackage {
  id: string;
  projectId: string;
  status: 'pending' | 'ready' | 'exported';
  tiers: ExportTier[];
  exportedAt?: string;
  checksums?: Record<string, string>;
}

export interface ExportTier {
  name: '/skills' | '/workspace' | '/automation' | '/baseline' | '/documentation' | '/portfolio' | '/exports';
  files: { filename: string; description: string; status: 'ready' | 'missing' | 'pending' }[];
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  businessProfile?: BusinessProfile;
  revenueLeaks?: RevenueLeak[];
  opportunities?: Opportunity[];
  selectedOpportunityId?: string;
  offer?: Offer;
  skills?: SkillFile[];
  contentAssets?: ContentAsset[];
  kpiBaselines?: KPIBaseline[];
  factLocks?: FactLock[];
  auditLog?: AuditLogEntry[];
  exportPackage?: ExportPackage;
}

