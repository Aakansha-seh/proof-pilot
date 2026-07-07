import { z } from "zod";

// ---------------------------------------------------------------------------
// Source records — every source-backed fact carries provenance.
// ---------------------------------------------------------------------------
export const SourceTypeEnum = z.enum([
  "official_site",
  "official_blog",
  "pricing_page",
  "news",
  "jobs",
  "app_store",
]);
export type SourceType = z.infer<typeof SourceTypeEnum>;

export const SourceRecordSchema = z.object({
  title: z.string(),
  url: z.string(),
  publisher: z.string(),
  publishedAt: z.string().optional(),
  retrievedAt: z.string(),
  sourceType: SourceTypeEnum,
});
export type SourceRecord = z.infer<typeof SourceRecordSchema>;

// ---------------------------------------------------------------------------
// Timeline events (last 24 months only for "current market" analysis).
// ---------------------------------------------------------------------------
export const EventTypeEnum = z.enum([
  "launch",
  "feature_update",
  "funding_news",
  "pricing_change",
  "hiring",
  "other",
]);
export type EventType = z.infer<typeof EventTypeEnum>;

export const TimelineEventSchema = z.object({
  title: z.string(),
  date: z.string(),
  competitor: z.string(),
  url: z.string().optional(),
  eventType: EventTypeEnum,
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

// ---------------------------------------------------------------------------
// Competitor profile — source-backed, never fabricates growth/valuation.
// ---------------------------------------------------------------------------
export const CompetitorSchema = z.object({
  name: z.string(),
  source: z.enum(["user", "ai_suggested"]),
  positioning: z.string(),
  targetAudience: z.string(),
  pricingModel: z.string(),
  coreCapabilities: z.array(z.string()),
  recentEvents: z.array(TimelineEventSchema),
  // 0-100 signals — clearly labeled, not revenue/user growth.
  marketActivitySignal: z.number().min(0).max(100),
  productOverlap: z.number().min(0).max(100),
  overlapSummary: z.string(),
  potentialGap: z.string(),
  // Set when little recent evidence was found in reviewed sources.
  activityLabel: z.string().optional(),
  sources: z.array(SourceRecordSchema),
  lastCheckedAt: z.string(),
});
export type Competitor = z.infer<typeof CompetitorSchema>;

// ---------------------------------------------------------------------------
// Whitespace hypotheses, Proof of Difference, and claim cross-check.
// ---------------------------------------------------------------------------
export const WhitespaceSchema = z.object({
  hypothesis: z.string(),
  whyOpen: z.string(),
  supportingEvidence: z.string(),
  mustValidate: z.string(),
});
export type Whitespace = z.infer<typeof WhitespaceSchema>;

export const ProofOfDifferenceSchema = z.object({
  differentiator: z.string(),
  competitorOverlap: z.enum(["low", "medium", "high"]),
  proofRequired: z.string(),
  recommendedAction: z.string(),
  defensibleWording: z.string(),
});
export type ProofOfDifference = z.infer<typeof ProofOfDifferenceSchema>;

export const ClaimCrossCheckSchema = z.object({
  claimId: z.string().optional(),
  claimText: z.string(),
  competitorRef: z.string().optional(),
  verdict: z.enum(["unsupported", "needs_benchmark", "plausible"]),
  reasoning: z.string(),
  saferRewrite: z.string(),
});
export type ClaimCrossCheck = z.infer<typeof ClaimCrossCheckSchema>;

// ---------------------------------------------------------------------------
// Run metadata (AMD timing shown only when AMD inference is actually used).
// ---------------------------------------------------------------------------
export const IntelMetaSchema = z.object({
  competitorsAnalyzed: z.number(),
  analysisDurationMs: z.number(),
  usedAmd: z.boolean(),
  providerUsed: z.string(),
  searchProvider: z.string(),
  sourcesReviewed: z.number(),
  generatedAt: z.string(),
});
export type IntelMeta = z.infer<typeof IntelMetaSchema>;

export const CompetitiveIntelResponseSchema = z.object({
  summary: z.string(),
  competitors: z.array(CompetitorSchema),
  timeline: z.array(TimelineEventSchema),
  whitespace: z.array(WhitespaceSchema),
  proofOfDifference: z.array(ProofOfDifferenceSchema),
  claimCrossCheck: z.array(ClaimCrossCheckSchema),
  meta: IntelMetaSchema,
});
export type CompetitiveIntelResponse = z.infer<
  typeof CompetitiveIntelResponseSchema
>;

// The AI returns everything except meta (added server-side after timing).
export const IntelModelOutputSchema = CompetitiveIntelResponseSchema.omit({
  meta: true,
});
export type IntelModelOutput = z.infer<typeof IntelModelOutputSchema>;
