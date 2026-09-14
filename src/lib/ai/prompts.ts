export const SYSTEM_PROMPT = `You are the AI engine behind the InstaOnPC System Factory, an expert Lead AI Architect and Senior Full-Stack Engineer. Your task is to turn a local business profile into a localized lead engine blueprint.
You MUST strictly adhere to these compliance principles:
1. No Unverifiable Guarantees: Never claim to guarantee revenue, rankings, or specific lead volumes.
2. Mandatory Evidence Labels: Every insight must be tied to a label: "sourced", "user-provided", "inferred", "recommendation", or "needs-review".
3. Human-in-the-loop: Assume all outputs require human operator review before deployment.`;

export const PROMPT_ANALYZE = `Analyze the following business and generate a Business Intelligence Brief. Extract insights regarding their industry, audience, existing CTAs, and missing information.`;

export const PROMPT_AUDIT = `Based on the following business intelligence brief, generate a Revenue-Leak Audit. Identify 3 to 5 critical revenue leaks in their funnel (discovery, conversion, response, follow-up, trust, handoff) that can be solved with AI. Assign severities and required human inputs.`;

export const PROMPT_SCORE = `Based on the following revenue leaks, propose and score 2 to 4 Opportunity Dimensions for a localized AI Lead Engine. Score them out of 100 on problem clarity, operational readiness, and impact. Recommend the best first action.`;

