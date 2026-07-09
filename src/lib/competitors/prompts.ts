import type { SearchResult } from "@/lib/search/types";

export type IntelContext = {
  idea: string;
  audience?: string;
  problem?: string;
  revenueModel?: string;
  knownCompetitors: string[];
  comparativeClaims: { id?: string; text: string }[];
};

export const INTEL_SYSTEM = `You are ProofPilot's Competitive Intelligence analyst.

You produce a source-backed, time-aware competitor analysis. You MUST NOT present
model memory as market fact. Ground every fact in the provided SOURCES bundle.

Hard rules:
- Only cite URLs that appear in the provided SOURCES. Never invent URLs.
- NEVER invent revenue growth, user growth, market share, valuation, or exact pricing.
  If a pricing model is not evidenced, say "Not found in reviewed sources."
- Only use events dated within the last ~24 months for recent activity.
- If little recent evidence exists for a competitor, set "activityLabel" to
  "Limited recent public activity found in reviewed sources." and use an empty sources array.
  Do NOT claim a company is inactive just because sources are sparse.
- "marketActivitySignal" (0-100) reflects recent source-backed signals
  (launches, dated changelog entries, funding/news, hiring, app-store updates,
  recent official publishing) — NOT revenue or user growth.
- "productOverlap" (0-100) is an AI-assisted interpretation of similarity to the
  user's idea/audience/problem.
- Whitespace items are HYPOTHESES only. Never claim "no competitor exists" unless
  the reviewed sources clearly support it.
- Stress-test the user's comparative/market/absolute claims against found evidence.
  If a benchmark was not supplied and sources don't establish the comparison,
  mark the claim "needs_benchmark" or "unsupported" and give a safer rewrite.

Return ONLY valid JSON, no markdown, no code fences.`;

export function intelUser(ctx: IntelContext, sources: SearchResult[]): string {
  const sourceLines = sources
    .map(
      (s, i) =>
        `[${i + 1}] (${s.sourceType}) ${s.title} — ${s.publisher}${
          s.publishedAt ? ` (${s.publishedAt})` : ""
        }\nURL: ${s.url}\nSNIPPET: ${s.snippet}`
    )
    .join("\n\n");

  return `USER PRODUCT CONTEXT
Idea: ${ctx.idea}
Audience: ${ctx.audience || "(not provided)"}
Problem: ${ctx.problem || "(not provided)"}
Revenue model: ${ctx.revenueModel || "(not provided)"}
Known competitors (user-supplied): ${
    ctx.knownCompetitors.length ? ctx.knownCompetitors.join(", ") : "(none)"
  }

COMPARATIVE / MARKET CLAIMS TO STRESS-TEST
${
  ctx.comparativeClaims.length
    ? ctx.comparativeClaims.map((c) => `- (${c.id ?? "n/a"}) ${c.text}`).join("\n")
    : "(none extracted)"
}

SOURCES (only cite these URLs; ${sources.length} total)
${sourceLines || "(no sources retrieved — mark competitors with activityLabel and empty sources)"}

TASK
Analyze 3-5 competitors most relevant to the user's product. Prefer user-supplied
names; you may add well-known relevant players as "ai_suggested". Return JSON:
{
  "summary": "<neutral market narrative grounded in sources>",
  "competitors": [{
    "name": "", "source": "user" | "ai_suggested",
    "positioning": "", "targetAudience": "", "pricingModel": "",
    "coreCapabilities": [""],
    "recentEvents": [{"title":"","date":"YYYY-MM-DD","competitor":"","url":"","eventType":"launch|feature_update|funding_news|pricing_change|hiring|other"}],
    "marketActivitySignal": 0, "productOverlap": 0,
    "overlapSummary": "", "potentialGap": "",
    "activityLabel": "(optional)",
    "sources": [{"title":"","url":"","publisher":"","publishedAt":"(optional)","retrievedAt":"${new Date().toISOString()}","sourceType":"official_site|official_blog|pricing_page|news|jobs|app_store"}],
    "lastCheckedAt": "${new Date().toISOString()}"
  }],
  "timeline": [{"title":"","date":"YYYY-MM-DD","competitor":"","url":"","eventType":"launch|feature_update|funding_news|pricing_change|hiring|other"}],
  "whitespace": [{"hypothesis":"","whyOpen":"","supportingEvidence":"","validationPlan":"<validation study or test to run>"}],
  "proofOfDifference": [{"differentiator":"","competitorOverlap":"low|medium|high","proofRequired":"","recommendedAction":"","defensibleWording":""}],
  "claimCrossCheck": [{"claimId":"(optional)","claimText":"","competitorRef":"(optional)","verdict":"unsupported|needs_benchmark|plausible","reasoning":"","saferRewrite":""}]
}`;
}
