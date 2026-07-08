import { z } from "zod";

// ---------------------------------------------------------------------------
// Core enums
// ---------------------------------------------------------------------------
export const ClaimCategory = z.enum([
  "factual",
  "performance",
  "market",
  "user_adoption",
  "technical",
  "comparative",
  "guarantee",
  "future_projection",
  "vague_marketing",
]);
export type ClaimCategory = z.infer<typeof ClaimCategory>;

export const RiskLevel = z.enum(["low", "medium", "high"]);
export type RiskLevel = z.infer<typeof RiskLevel>;

export const EvidenceStatus = z.enum([
  "supported",
  "partially_supported",
  "unsupported",
  "needs_evidence",
]);
export type EvidenceStatus = z.infer<typeof EvidenceStatus>;

export const Priority = z.enum(["low", "medium", "high"]);

// The four Claim-Map buckets.
export const ClaimGroup = z.enum([
  "proven",
  "needs_evidence",
  "risky_language",
  "future_validation",
]);
export type ClaimGroup = z.infer<typeof ClaimGroup>;

// ---------------------------------------------------------------------------
// Validation plan + claim
// ---------------------------------------------------------------------------
export const ValidationPlanSchema = z.object({
  goal: z.string(),
  method: z.string(),
  metric: z.string(),
  success_criteria: z.string(),
});
export type ValidationPlan = z.infer<typeof ValidationPlanSchema>;

export const ClaimSchema = z.object({
  id: z.string(),
  claim_text: z.string(),
  claim_category: ClaimCategory,
  risk_level: RiskLevel,
  evidence_status: EvidenceStatus,
  confidence_score: z.number().min(0).max(1),
  why_it_matters: z.string(),
  evidence_needed: z.array(z.string()),
  validation_plan: ValidationPlanSchema,
  credible_rewrite: z.string(),
  priority: Priority,
  // Which Claim-Map bucket this claim belongs to.
  group: ClaimGroup,
});
export type Claim = z.infer<typeof ClaimSchema>;

export const ClaimAuditResponseSchema = z.object({
  overall_credibility_score: z.number().min(0).max(100),
  summary: z.string(),
  top_risks: z.array(z.string()),
  recommended_next_step: z.string(),
  claims: z.array(ClaimSchema),
});
export type ClaimAuditResponse = z.infer<typeof ClaimAuditResponseSchema>;

// ---------------------------------------------------------------------------
// Image analysis
// ---------------------------------------------------------------------------
export const VisibleMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const ImageAnalysisResponseSchema = z.object({
  extracted_text: z.string(),
  visible_claims: z.array(z.string()),
  visible_metrics: z.array(VisibleMetricSchema),
  evidence_summary: z.string(),
  limitations: z.array(z.string()),
});
export type ImageAnalysisResponse = z.infer<typeof ImageAnalysisResponseSchema>;

// ---------------------------------------------------------------------------
// Evidence Pack
// ---------------------------------------------------------------------------
export const EvidencePackResponseSchema = z.object({
  executive_summary: z.string(),
  evidence_gap_analysis: z.string(),
  validation_roadmap: z.array(
    z.object({
      claim_ref: z.string(),
      action: z.string(),
      metric: z.string(),
      timeframe: z.string(),
    })
  ),
  next_7_days: z.array(z.string()),
});
export type EvidencePackResponse = z.infer<typeof EvidencePackResponseSchema>;

// ---------------------------------------------------------------------------
// Locally-stored evidence + saved audit
// ---------------------------------------------------------------------------
export const EvidenceItemSchema = z.object({
  id: z.string(),
  claimId: z.string().optional(),
  type: z.enum(["image", "metric", "note", "link"]),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  uploadedAt: z.string(),
  extractedText: z.string().optional(),
  evidenceSummary: z.string().optional(),
  status: z.enum([
    "attached",
    "needs_review",
    "user_reported",
    "validation_pending",
  ]),
  note: z.string().optional(),
  url: z.string().optional(),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

// A competitor stress-test result fed back onto a Claim Map claim.
export type CompetitiveSignal = {
  claimId: string;
  verdict: "unsupported" | "needs_benchmark" | "plausible";
  reasoning: string;
  saferRewrite: string;
  competitorRef?: string;
  checkedAt: string;
};

// A re-audited version of the pitch, for the live improvement timeline.
export type AuditRevision = {
  label: string;
  text: string;
  score: number;
  createdAt: string;
};

// A validation task added from the Competitors "What must you prove to win?" panel.
export type StrategyTask = {
  id: string;
  text: string;
  proofType?: string;
  priority?: "low" | "medium" | "high";
  owner?: string;
  effort?: string;
  done: boolean;
  createdAt: string;
};

export type SavedAudit = {
  id: string;
  title: string;
  sourceType: "pasted_text" | "pdf" | "txt" | "image";
  documentName?: string;
  originalText: string;
  providerUsed: "nvidia" | "fireworks" | "amd";
  audit: ClaimAuditResponse;
  rewrittenPitch?: string;
  evidenceItems: EvidenceItem[];
  // Optional Competitive Intelligence run attached to this audit.
  competitiveIntel?: import("@/lib/competitors/schema").CompetitiveIntelResponse;
  // Validation tasks captured from the competitor strategy panel.
  strategyTasks?: StrategyTask[];
  // Competitor stress-test signals keyed by claim id.
  competitiveSignals?: Record<string, CompetitiveSignal>;
  // Score history from iterative re-audits (v0 = Original).
  revisions?: AuditRevision[];
  createdAt: string;
  updatedAt: string;
};
