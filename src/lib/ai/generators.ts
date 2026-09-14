import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { SYSTEM_PROMPT, PROMPT_ANALYZE, PROMPT_AUDIT, PROMPT_SCORE } from './prompts';
import type { BusinessProfile, RevenueLeak, Opportunity } from '../types';

// Zod schemas matching our types.ts
const evidenceItemSchema = z.object({
  id: z.string(),
  label: z.enum(['sourced', 'user-provided', 'inferred', 'recommendation', 'needs-review']),
  claim: z.string(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

const businessProfileSchema = z.object({
  summary: z.string(),
  audienceDescription: z.string(),
  conversionObservations: z.array(evidenceItemSchema).optional(),
  faqInventory: z.array(evidenceItemSchema).optional(),
  existingCTAs: z.array(evidenceItemSchema).optional(),
  bookingPathways: z.array(evidenceItemSchema).optional(),
  publicProof: z.array(evidenceItemSchema).optional(),
  missingInfo: z.array(z.string()).optional(),
});

const revenueLeakSchema = z.object({
  id: z.string(),
  category: z.enum(['discovery', 'conversion', 'response', 'follow-up', 'trust', 'handoff']),
  observation: z.string(),
  evidence: z.string(),
  evidenceLabel: z.enum(['sourced', 'user-provided', 'inferred', 'recommendation', 'needs-review']),
  severity: z.enum(['low', 'medium', 'high']),
  recommendedAction: z.string(),
  requiredHumanInput: z.string(),
  risk: z.string().optional(),
  dependency: z.string().optional(),
});

const opportunityDimensionSchema = z.object({
  name: z.string(),
  score: z.number(),
  weight: z.number(),
  rationale: z.string(),
});

const opportunitySchema = z.object({
  id: z.string(),
  rank: z.number(),
  name: z.string(),
  problem: z.string(),
  whySelected: z.string(),
  compositeScore: z.number(),
  dimensions: z.array(opportunityDimensionSchema),
  requiredInputs: z.array(z.string()),
  requiredComponents: z.array(z.string()),
  complexity: z.enum(['low', 'medium', 'high']),
  dependencies: z.array(z.string()),
  risks: z.array(z.string()),
  humanReviewPoints: z.array(z.string()),
  measurementDefinition: z.string(),
  suggestedFirstAction: z.string(),
});

export async function generateAIAnalysis(profile: Partial<BusinessProfile>): Promise<Partial<BusinessProfile>> {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    prompt: `${PROMPT_ANALYZE}\n\nBusiness Profile Data:\n${JSON.stringify(profile, null, 2)}`,
    schema: businessProfileSchema,
  });
  return object;
}

export async function generateAIAudit(profile: BusinessProfile): Promise<RevenueLeak[]> {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    prompt: `${PROMPT_AUDIT}\n\nBusiness Intelligence Brief:\n${JSON.stringify(profile, null, 2)}`,
    schema: z.object({ leaks: z.array(revenueLeakSchema) }),
  });
  const leaks = object.leaks.map(l => ({ ...l, projectId: profile.projectId }));
  return leaks;
}

export async function generateAIScore(leaks: RevenueLeak[]): Promise<Opportunity[]> {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    prompt: `${PROMPT_SCORE}\n\nRevenue Leaks:\n${JSON.stringify(leaks, null, 2)}`,
    schema: z.object({ opportunities: z.array(opportunitySchema) }),
  });
  const opportunities = object.opportunities.map(o => ({ ...o, projectId: leaks[0]?.projectId ?? 'unknown' }));
  return opportunities;
}

