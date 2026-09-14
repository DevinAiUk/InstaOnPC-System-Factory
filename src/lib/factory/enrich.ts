import type { FactoryProject, FactoryAsset } from "./model";
export function additionalAssets(p: FactoryProject): FactoryAsset[] {
  const b = p.businessProfile!;
  const approved = p.sources.filter((s) => s.approved);
  const channels = [
    "Blog outline",
    "LinkedIn post",
    "Google Business Profile post",
    "Email update",
    "Short-form social",
    "Video script",
  ];
  const basics = `${b.name} lists ${b.services.join(", ") || "services awaiting confirmation"} in ${b.city}.`;
  const notes = `\n\nOwner: Operator\nNext action: Verify the source, humanize and review the draft before publication.\nStatus: Draft\nSources: ${approved.map((s) => s.id).join(", ") || "No approved sources; needs review"}`;
  const entries: FactoryAsset[] = channels.map((name, i) => ({
    id: "channel-" + i,
    name,
    kind: "content",
    body:
      i === 0
        ? `# Blog outline: choosing ${b.services[0] || b.industry} in ${b.city}\n\n1. Describe the customer question using approved FAQs.\n2. Explain the confirmed service scope: ${b.services.join(", ")}.\n3. List questions to ask about availability and pricing.\n4. Invite the reader to contact ${b.name}.\n\nDo not add unsourced statistics or testimonials.${notes}`
        : i === 5
          ? `# Video script · ${b.name}\n\nOpening: Looking for ${b.services[0] || b.industry} in ${b.city}?\nBody: ${basics}\nClose: Ask the team about scope and availability.\n\nIf using an AI presenter, clearly disclose synthetic media. Do not impersonate a customer or invent endorsements.${notes}`
          : `# ${name} · ${b.name}\n\n${basics}\n\nHave a question about ${b.services[0] || "service"}? Ask the team to confirm scope and availability. ${b.url || "Contact destination needs review."}${notes}`,
    version: 1,
    status: "draft",
    owner: "Operator",
    nextAction: "Review source facts and channel fit",
    locked: false,
    history: [],
    sourceIds: approved.map((s) => s.id),
  }));
  entries.push({
    id: "knowledge-base",
    name: "Business knowledge base",
    kind: "sop",
    body: JSON.stringify(
      {
        projectId: p.id,
        status: "draft",
        business: b.name,
        services: b.services,
        serviceArea: b.serviceArea || b.city,
        pricingGuidance: b.pricingGuidance || null,
        faqSource: b.faqs || null,
        sources: approved.map((s) => ({ id: s.id, url: s.url, text: s.text })),
        unknownAnswer:
          "I do not have a confirmed answer. I can route this to the team.",
        handoff: [
          "Uncertain answer",
          "Pricing exception",
          "Complaint",
          "Sensitive medical, legal or financial advice",
          "Emergency",
        ],
        owner: "Operator",
        nextAction: "Confirm FAQs, pricing and escalation contact",
      },
      null,
      2,
    ),
    version: 1,
    status: "draft",
    owner: "Operator",
    nextAction: "Confirm FAQs, pricing and escalation contact",
    locked: false,
    history: [],
    sourceIds: approved.map((s) => s.id),
  });
  return entries;
}
