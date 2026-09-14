// Safeguards Engine: Audits generated text for prohibited guarantee/claim patterns

export const PROHIBITED_PATTERNS = [
  { id: 'RANKING_GUARANTEE',     regex: /\b(guarantee|promise|will)\s+(rank|place|appear|show up)\s+(#1|top|page\s+1|first\s+page|number\s+one)\b/i },
  { id: 'AI_CITATION_GUARANTEE', regex: /\b(guarantee|ensure)\s+(ai\s+citation|chatgpt\s+mention|searchgpt|gpt\s+will)\b/i },
  { id: 'TRAFFIC_SPIKE_CLAIM',   regex: /\b(guarantee|will)\s+(double|triple|10x|boost)\s+(traffic|visitors|clicks|impressions)\b/i },
  { id: 'LEAD_VOLUME_PROMISE',   regex: /\b(guarantee|generate)\s+(\d+|\w+)\s+(leads|inquiries|calls)\s+(per|a)\s+(month|week)\b/i },
  { id: 'STAFF_REPLACEMENT',     regex: /\b(replace|eliminate|get\s+rid\s+of)\s+(all|your|100%|entire)\s+(receptionists|staff|employees|team)\b/i },
  { id: 'FINANCIAL_ROI_CLAIM',   regex: /\b(guaranteed\s+roi|return\s+on\s+investment|will\s+increase\s+revenue|will\s+save\s+you)\b/i },
  { id: 'CONVERSION_PROMISE',    regex: /\b(guarantee|will\s+achieve)\s+(\d+%\s+)?conversion\s+rate\b/i },
  { id: 'RANKING_PROMISE_2',     regex: /\bwill\s+get\s+you\s+(ranked|to\s+the\s+top|on\s+page\s+1)\b/i },
];

export interface SafeguardCheckResult {
  passed: boolean;
  violations: { id: string; match: string }[];
  sanitizedContent: string;
}

export function auditContentSafeguards(content: string): SafeguardCheckResult {
  const violations: { id: string; match: string }[] = [];
  let sanitizedContent = content;

  for (const pattern of PROHIBITED_PATTERNS) {
    const match = content.match(pattern.regex);
    if (match) {
      violations.push({ id: pattern.id, match: match[0] });
      sanitizedContent = sanitizedContent.replace(
        pattern.regex,
        '[CLAIM REMOVED — requires human review]'
      );
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    sanitizedContent,
  };
}

export function assertSafeguardsPass(content: string): void {
  const result = auditContentSafeguards(content);
  if (!result.passed) {
    throw new Error(
      `Safeguard violation(s) detected: ${result.violations.map(v => v.id).join(', ')}`
    );
  }
}

