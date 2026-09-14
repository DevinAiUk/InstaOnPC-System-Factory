import type { Project } from '../types';

// ─────────────────────────────────────────────
// DEMO PROJECT 1: Tampa Bay Home Services
// ─────────────────────────────────────────────
const project1: Project = {
  id: 'proj_01',
  name: 'Suncoast Pro Services',
  status: 'reviewing',
  createdAt: '2026-09-01T09:00:00Z',
  updatedAt: '2026-09-10T14:30:00Z',
  businessProfile: {
    id: 'bp_01', projectId: 'proj_01',
    name: 'Suncoast Pro Services',
    url: 'https://suncoastpro.com',
    industry: 'Home Services',
    city: 'Tampa',
    serviceArea: 'Tampa Bay, Hillsborough County',
    services: ['HVAC repair & installation', 'Plumbing', 'Electrical', 'Emergency services'],
    primaryGoal: 'leads',
    bookingTool: 'Phone only',
    crm: 'Paper logbook',
    communicationChannels: ['Phone', 'Website contact form'],
    teamSize: '6–10',
    businessHours: 'Mon–Fri 7AM–6PM, Sat 8AM–2PM',
    painPoints: 'Losing after-hours estimate requests. Phone goes to voicemail after 6PM and on Sundays. No automated response. Customers call competitors who answer.',
    summary: 'Suncoast Pro Services is a Tampa Bay–based home services contractor specializing in HVAC, plumbing, and electrical. They have strong word-of-mouth but no digital inquiry system. After-hours requests — estimated 30–40% of total inquiry volume — go unanswered.',
    audienceDescription: 'Homeowners in Hillsborough County, primarily 35–65, dealing with urgent home repair needs.',
    conversionObservations: [
      { id: 'ci_01', label: 'sourced', claim: 'Website contact form has no confirmation message after submission.', source: 'suncoastpro.com (observed 2026-09-01)' },
      { id: 'ci_02', label: 'inferred', claim: 'No phone number visible above the fold on mobile.', source: 'Mobile viewport check' },
      { id: 'ci_03', label: 'user-provided', claim: 'Approximately 30–40% of inquiries come after business hours.', source: 'Owner interview' },
    ],
    faqInventory: [
      { id: 'faq_01', label: 'needs-review', claim: 'No FAQ page exists on the current website.', notes: 'Common questions include: service area coverage, emergency fees, booking turnaround.' },
    ],
    existingCTAs: [
      { id: 'cta_01', label: 'sourced', claim: '"Call us" button in footer only. No estimate request form.', source: 'suncoastpro.com' },
    ],
    bookingPathways: [
      { id: 'bp_path_01', label: 'user-provided', claim: 'All bookings happen over the phone. No online scheduling system in use.' },
    ],
    publicProof: [
      { id: 'pp_01', label: 'sourced', claim: '4.6 star average on Google (87 reviews).', source: 'Google Business Profile' },
      { id: 'pp_02', label: 'sourced', claim: 'No testimonials displayed on website.', source: 'suncoastpro.com' },
    ],
    missingInfo: ['After-hours voicemail callback rate', 'Estimate-to-booking conversion rate', 'Monthly inquiry volume baseline'],
  },
  revenueLeaks: [
    {
      id: 'rl_01', projectId: 'proj_01', category: 'response',
      observation: 'No after-hours inquiry capture system exists.',
      evidence: 'Owner confirmed phone goes to voicemail after 6PM with no callback promise or form.',
      evidenceLabel: 'user-provided', severity: 'high',
      recommendedAction: 'Implement AI Front Desk with after-hours intake, callback scheduling, and owner notification.',
      requiredHumanInput: 'Owner must approve escalation triggers, emergency routing rules, and response time commitments.',
      risk: 'Without a baseline inquiry count, impact cannot be measured. Establish baseline before launch.',
    },
    {
      id: 'rl_02', projectId: 'proj_01', category: 'conversion',
      observation: 'Contact form has no confirmation, no estimated response time.',
      evidence: 'Sourced from website observation.',
      evidenceLabel: 'sourced', severity: 'medium',
      recommendedAction: 'Add confirmation message with response time expectation. Route submissions to owner via email/SMS.',
      requiredHumanInput: 'Owner to confirm acceptable response time commitment (e.g., "within 2 business hours").',
    },
    {
      id: 'rl_03', projectId: 'proj_01', category: 'trust',
      observation: '87 Google reviews not surfaced on website.',
      evidence: 'No testimonial section on website. Reviews exist on GBP.',
      evidenceLabel: 'sourced', severity: 'medium',
      recommendedAction: 'Add a reviews or social proof section. Link to Google Business Profile.',
      requiredHumanInput: 'Owner selects which reviews to feature.',
    },
    {
      id: 'rl_04', projectId: 'proj_01', category: 'discovery',
      observation: 'No mobile-visible phone number above the fold.',
      evidence: 'Mobile viewport inspection.',
      evidenceLabel: 'inferred', severity: 'medium',
      recommendedAction: 'Add sticky click-to-call button for mobile users.',
      requiredHumanInput: 'None — technical implementation only.',
    },
  ],
  opportunities: [
    {
      id: 'opp_01', projectId: 'proj_01', rank: 1,
      name: 'AI Front Desk + After-Hours Capture',
      problem: 'Estimated 30–40% of inquiries arrive after hours and are lost to voicemail.',
      whySelected: 'Highest urgency. Observable problem with clear solution path. Owner confirmed pain point. Delivers measurable response rate improvement within 30 days.',
      compositeScore: 82,
      dimensions: [
        { name: 'Urgency', score: 90, weight: 0.25, rationale: 'Owner explicitly identified after-hours loss as primary problem.' },
        { name: 'Financial Value', score: 80, weight: 0.20, rationale: 'Each captured estimate request has estimated $200–$800 job value. Baseline not yet confirmed — labeled as inferred.' },
        { name: 'Frequency', score: 85, weight: 0.15, rationale: 'After-hours inquiries occur daily.' },
        { name: 'Buyer Access & Evidence', score: 75, weight: 0.15, rationale: 'Owner engaged, has decision authority, baseline data is partial.' },
        { name: 'Delivery Feasibility', score: 80, weight: 0.15, rationale: 'Standard AI intake workflow. No complex integrations required for MVP.' },
        { name: 'Evidence Quality', score: 70, weight: 0.10, rationale: 'Pain confirmed by owner. Volume estimate is user-provided, not measured.' },
      ],
      requiredInputs: ['Approved FAQ and service list', 'Emergency escalation contacts', 'Response time commitment', 'Consent and disclosure language'],
      requiredComponents: ['AI Front Desk intake', 'After-hours boundary rules', 'Owner notification workflow', 'Lead capture form'],
      complexity: 'medium',
      dependencies: ['Owner approval of escalation rules', 'Baseline inquiry count'],
      risks: ['Cannot measure impact without a pre-launch baseline', 'Escalation rules must be reviewed before activation'],
      humanReviewPoints: ['Escalation trigger list', 'After-hours response boundary language', 'Consent language approval'],
      measurementDefinition: 'After-hours inquiry capture rate (% of after-hours contacts that result in a captured lead record).',
      suggestedFirstAction: 'Establish current after-hours contact baseline (2-week tracking period) before activating AI intake.',
      selected: true,
    },
  ],
  offer: {
    id: 'offer_01', projectId: 'proj_01', version: 1, status: 'approved',
    buyer: 'Suncoast Pro Services owner',
    businessProblem: 'After-hours estimate requests are lost to voicemail, resulting in missed service opportunities.',
    proposedSystem: 'AI Front Desk + Local Lead Engine',
    scope: ['After-hours AI intake form on website', 'Owner SMS/email notification on new lead', 'Lead record in simple CRM spreadsheet', 'Google Business Profile audit checklist', 'Approved FAQ knowledge base (first version)'],
    exclusions: ['Live phone answering', 'Automated booking confirmation', 'Custom CRM integration', 'Paid advertising management'],
    clientResponsibilities: ['Provide approved FAQ and service descriptions', 'Review and approve escalation rules', 'Confirm response time commitment', 'Review lead records weekly'],
    implementationAssumptions: ['Owner will provide emergency contact within 3 business days', 'Website can accept a simple embed or link', 'No HIPAA, financial, or legal compliance requirements apply'],
    pricingLogic: 'Scoped as a fixed-scope implementation engagement. Pricing to be confirmed in discovery call based on scope confirmation and tools required.',
    optionalUpgrades: ['SMS auto-reply for new inquiries', 'Review request automation after completed jobs', 'Monthly reporting dashboard'],
    approvalRequirements: ['Client signs off on FAQ knowledge base', 'Client approves escalation rules', 'Client approves disclosure language before activation'],
    approvedAt: '2026-09-08T10:00:00Z',
    approvedBy: 'Operator review',
  },
  factLocks: [
    { id: 'fl_01', projectId: 'proj_01', field: 'Business hours', value: 'Mon–Fri 7AM–6PM, Sat 8AM–2PM', locked: true, lockedAt: '2026-09-05T09:00:00Z', lockedBy: 'Operator', approvedBy: 'Owner confirmed' },
    { id: 'fl_02', projectId: 'proj_01', field: 'Service area', value: 'Tampa Bay, Hillsborough County', locked: true, lockedAt: '2026-09-05T09:00:00Z', lockedBy: 'Operator' },
    { id: 'fl_03', projectId: 'proj_01', field: 'Emergency escalation contact', value: 'Needs owner confirmation', locked: false },
  ],
  kpiBaselines: [
    { id: 'kpi_01', projectId: 'proj_01', metric: 'After-hours inquiry capture rate', currentValue: 'Not yet measured', measurementMethod: 'Count of lead records created outside of business hours ÷ total estimated after-hours contacts', dataLimitations: 'Baseline requires 2-week manual tracking period before AI intake activation.', nextReviewDate: '2026-10-15', reportingCadence: 'Monthly' },
    { id: 'kpi_02', projectId: 'proj_01', metric: 'Lead response time', currentValue: 'Unknown — no tracking in place', measurementMethod: 'Time between lead record created and first owner response logged.', dataLimitations: 'Requires CRM or log to track.', nextReviewDate: '2026-10-15', reportingCadence: 'Monthly' },
  ],
  auditLog: [
    { id: 'al_01', projectId: 'proj_01', action: 'Project created', target: 'Project', performedBy: 'Operator', timestamp: '2026-09-01T09:00:00Z' },
    { id: 'al_02', projectId: 'proj_01', action: 'Business Intelligence generated', target: 'BusinessProfile', performedBy: 'System (mock)', timestamp: '2026-09-02T11:00:00Z' },
    { id: 'al_03', projectId: 'proj_01', action: 'Revenue Leak Audit generated', target: 'RevenueLeak', performedBy: 'System (mock)', timestamp: '2026-09-03T14:00:00Z' },
    { id: 'al_04', projectId: 'proj_01', action: 'Offer approved', target: 'offer_01', performedBy: 'Operator', timestamp: '2026-09-08T10:00:00Z' },
    { id: 'al_05', projectId: 'proj_01', action: 'Fact lock applied: Business hours', target: 'fl_01', performedBy: 'Operator', timestamp: '2026-09-05T09:00:00Z' },
  ],
};

// ─────────────────────────────────────────────
// DEMO PROJECT 2: St. Petersburg Salon
// ─────────────────────────────────────────────
const project2: Project = {
  id: 'proj_02',
  name: 'Bloom Beauty Salon',
  status: 'building',
  createdAt: '2026-09-05T10:00:00Z',
  updatedAt: '2026-09-12T09:00:00Z',
  businessProfile: {
    id: 'bp_02', projectId: 'proj_02',
    name: 'Bloom Beauty Salon',
    url: 'https://bloombeautystpete.com',
    industry: 'Beauty & Wellness',
    city: 'St. Petersburg',
    serviceArea: 'St. Petersburg, Pinellas County',
    services: ['Hair cutting & styling', 'Color', 'Balayage', 'Keratin treatments', 'Blow-outs'],
    primaryGoal: 'bookings',
    bookingTool: 'Instagram DMs (informal)',
    crm: 'None',
    communicationChannels: ['Instagram', 'Phone', 'Walk-ins'],
    teamSize: '1–5',
    businessHours: 'Tue–Sat 9AM–6PM',
    painPoints: 'Booking happens through Instagram DMs — hard to track, easy to miss. FAQ questions repeat constantly. No visible local SEO presence. Google Business Profile incomplete.',
    summary: 'Bloom Beauty Salon is a boutique St. Petersburg salon known for color and balayage. Bookings currently happen via Instagram DMs, creating a backlog of unanswered messages and no-shows.',
  },
  revenueLeaks: [
    { id: 'rl_05', projectId: 'proj_02', category: 'response', observation: 'Booking intake through Instagram DMs creates missed messages and no formal confirmation.', evidence: 'Owner confirmed during intake.', evidenceLabel: 'user-provided', severity: 'high', recommendedAction: 'Add booking intake form or chatbot with appointment confirmation logic.', requiredHumanInput: 'Owner must define service menu with durations and approve confirmation message.' },
    { id: 'rl_06', projectId: 'proj_02', category: 'discovery', observation: 'Google Business Profile is incomplete — missing photos, services, and booking link.', evidence: 'GBP observation.', evidenceLabel: 'sourced', severity: 'high', recommendedAction: 'Complete GBP with service list, hours, photos, and booking link.', requiredHumanInput: 'Owner provides photos and approves service descriptions.' },
    { id: 'rl_07', projectId: 'proj_02', category: 'trust', observation: 'No FAQ page on website. Owner answers the same questions repeatedly on Instagram.', evidence: 'Owner confirmed.', evidenceLabel: 'user-provided', severity: 'medium', recommendedAction: 'Build approved FAQ knowledge base and publish to website.', requiredHumanInput: 'Owner reviews and approves FAQ content.' },
  ],
  opportunities: [
    { id: 'opp_02', projectId: 'proj_02', rank: 1, name: 'Booking Intake + FAQ Handler', problem: 'No structured booking system. FAQ answers scattered across DMs.', whySelected: 'Directly addresses stated primary goal (bookings). FAQ automation reduces owner time on repetitive messages.', compositeScore: 78, dimensions: [
      { name: 'Urgency', score: 85, weight: 0.25, rationale: 'Immediate booking friction.' },
      { name: 'Financial Value', score: 75, weight: 0.20, rationale: 'Each no-show or missed booking has direct revenue impact.' },
      { name: 'Frequency', score: 80, weight: 0.15, rationale: 'Booking requests and FAQ questions arrive daily.' },
      { name: 'Buyer Access & Evidence', score: 70, weight: 0.15, rationale: 'Owner available and engaged.' },
      { name: 'Delivery Feasibility', score: 75, weight: 0.15, rationale: 'Standard workflow. Requires service-menu input from owner.' },
      { name: 'Evidence Quality', score: 70, weight: 0.10, rationale: 'User-provided evidence, not yet measured.' },
    ], requiredInputs: ['Service menu with durations and pricing guidance', 'Approved FAQ content', 'Booking confirmation language'], requiredComponents: ['AI booking intake form', 'FAQ knowledge base', 'Confirmation message', 'Owner notification'], complexity: 'low', dependencies: ['Owner provides service menu'], risks: ['Service menu must be complete before intake activation'], humanReviewPoints: ['Booking confirmation language', 'No-show policy statement', 'FAQ content review'], measurementDefinition: 'Bookings captured via new system per week vs. prior DM baseline.', suggestedFirstAction: 'Owner documents service list with durations and pricing guidance.', selected: true },
  ],
  factLocks: [
    { id: 'fl_04', projectId: 'proj_02', field: 'Service area', value: 'St. Petersburg, Pinellas County', locked: true, lockedAt: '2026-09-07T10:00:00Z', lockedBy: 'Operator' },
    { id: 'fl_05', projectId: 'proj_02', field: 'Service menu', value: 'Pending owner confirmation', locked: false },
  ],
  kpiBaselines: [
    { id: 'kpi_03', projectId: 'proj_02', metric: 'Weekly bookings captured', currentValue: 'Unknown — tracked informally via DMs', measurementMethod: 'Booking records created in new system per week.', dataLimitations: 'No prior booking system. Baseline requires 2-week DM count.', nextReviewDate: '2026-11-01', reportingCadence: 'Weekly for first 30 days, then monthly' },
  ],
  auditLog: [
    { id: 'al_06', projectId: 'proj_02', action: 'Project created', target: 'Project', performedBy: 'Operator', timestamp: '2026-09-05T10:00:00Z' },
    { id: 'al_07', projectId: 'proj_02', action: 'Revenue Leak Audit generated', target: 'RevenueLeak', performedBy: 'System (mock)', timestamp: '2026-09-07T09:00:00Z' },
  ],
};

// ─────────────────────────────────────────────
// DEMO PROJECT 3: B2B Consultant
// ─────────────────────────────────────────────
const project3: Project = {
  id: 'proj_03',
  name: 'Meridian Strategy Group',
  status: 'scoring',
  createdAt: '2026-09-10T08:00:00Z',
  updatedAt: '2026-09-13T11:00:00Z',
  businessProfile: {
    id: 'bp_03', projectId: 'proj_03',
    name: 'Meridian Strategy Group',
    url: 'https://meridianstrategy.co',
    industry: 'B2B Consulting',
    city: 'Tampa',
    serviceArea: 'Tampa Bay, Remote nationwide',
    services: ['Operations consulting', 'Process improvement', 'Team leadership coaching', 'Fractional COO engagements'],
    primaryGoal: 'leads',
    bookingTool: 'Calendly',
    crm: 'Notion (informal)',
    communicationChannels: ['LinkedIn', 'Email', 'Referrals'],
    teamSize: '1',
    businessHours: 'Mon–Thu 9AM–5PM',
    painPoints: 'Deep expertise but no consistent content or lead nurture. LinkedIn posts inconsistent. No email follow-up sequence after a discovery call. Prospects go cold.',
    summary: 'Meridian Strategy Group is a solo B2B consulting practice with strong client outcomes but inconsistent market presence. The consultant relies on referrals and occasional LinkedIn posts with no systematic follow-up process.',
  },
  revenueLeaks: [
    { id: 'rl_08', projectId: 'proj_03', category: 'follow-up', observation: 'No follow-up sequence after discovery calls. Prospects go cold.', evidence: 'Consultant confirmed no CRM or email sequence in place.', evidenceLabel: 'user-provided', severity: 'high', recommendedAction: 'Build a 3-step follow-up email sequence with manual approval checkpoint before each send.', requiredHumanInput: 'Consultant approves each email before sending. Sequence must match consultant voice.' },
    { id: 'rl_09', projectId: 'proj_03', category: 'conversion', observation: 'Website has no clear lead capture mechanism beyond a contact form.', evidence: 'Website observation.', evidenceLabel: 'sourced', severity: 'medium', recommendedAction: 'Add a "Book a 20-minute call" CTA with Calendly integration.', requiredHumanInput: 'Consultant confirms call framing and availability.' },
    { id: 'rl_10', projectId: 'proj_03', category: 'trust', observation: 'No case studies or client outcomes on website.', evidence: 'Website observation.', evidenceLabel: 'sourced', severity: 'medium', recommendedAction: 'Build an outcomes-focused proof section using approved client examples (with permission).', requiredHumanInput: 'Consultant must confirm client permissions before publishing.' },
  ],
  opportunities: [
    { id: 'opp_03', projectId: 'proj_03', rank: 1, name: 'Follow-Up Sequence + Lead Capture', problem: 'Discovery call prospects go cold with no structured follow-up.', whySelected: 'Directly addresses stated pain. Low implementation complexity for a solo operator.', compositeScore: 74, dimensions: [
      { name: 'Urgency', score: 80, weight: 0.25, rationale: 'Every cold lead is a lost engagement opportunity.' },
      { name: 'Financial Value', score: 85, weight: 0.20, rationale: 'B2B consulting engagements have high per-client value.' },
      { name: 'Frequency', score: 65, weight: 0.15, rationale: 'Lower volume than B2C but higher per-deal value.' },
      { name: 'Buyer Access & Evidence', score: 70, weight: 0.15, rationale: 'Solo operator, high engagement, data is user-provided.' },
      { name: 'Delivery Feasibility', score: 75, weight: 0.15, rationale: 'Email sequence + Calendly. No complex integration.' },
      { name: 'Evidence Quality', score: 60, weight: 0.10, rationale: 'Pain self-reported. No CRM data to verify.' },
    ], requiredInputs: ['Discovery call follow-up timing preference', 'Approved email voice samples', 'Calendly link'], requiredComponents: ['3-email follow-up sequence', 'Lead capture CTA', 'Manual approval checkpoint'], complexity: 'low', dependencies: ['Consultant provides voice-approved email samples'], risks: ['Email sequence must be approved by consultant before any send'], humanReviewPoints: ['Each email in sequence before send', 'Client permission for case studies'], measurementDefinition: 'Discovery calls booked per month and follow-up response rate.', suggestedFirstAction: 'Consultant provides 2–3 example emails written in their voice for humanization reference.', selected: true },
  ],
  auditLog: [
    { id: 'al_08', projectId: 'proj_03', action: 'Project created', target: 'Project', performedBy: 'Operator', timestamp: '2026-09-10T08:00:00Z' },
    { id: 'al_09', projectId: 'proj_03', action: 'Business Intelligence generated', target: 'BusinessProfile', performedBy: 'System (mock)', timestamp: '2026-09-11T10:00:00Z' },
  ],
};

export const SEED_PROJECTS: Project[] = [project1, project2, project3];

