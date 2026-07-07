import type {
  ClaimCategory,
  ClaimGroup,
  RiskLevel,
  EvidenceStatus,
} from "@/lib/schemas";

export const GROUP_META: Record<
  ClaimGroup,
  { label: string; token: string; badge: "proven" | "risk" | "warn" | "future" }
> = {
  proven: { label: "Proven", token: "--proven", badge: "proven" },
  needs_evidence: { label: "Needs Evidence", token: "--warn", badge: "warn" },
  risky_language: { label: "Risky Language", token: "--risk", badge: "risk" },
  future_validation: { label: "Future Validation", token: "--future", badge: "future" },
};

export const RISK_BADGE: Record<RiskLevel, "proven" | "warn" | "risk"> = {
  low: "proven",
  medium: "warn",
  high: "risk",
};

export const CATEGORY_LABEL: Record<ClaimCategory, string> = {
  factual: "Factual",
  performance: "Performance",
  market: "Market",
  user_adoption: "User adoption",
  technical: "Technical",
  comparative: "Comparative",
  guarantee: "Guarantee",
  future_projection: "Future projection",
  vague_marketing: "Vague marketing",
};

export const EVIDENCE_LABEL: Record<EvidenceStatus, string> = {
  supported: "Supported",
  partially_supported: "Partially supported",
  unsupported: "Unsupported",
  needs_evidence: "Needs evidence",
};

export const GROUP_ORDER: ClaimGroup[] = [
  "proven",
  "needs_evidence",
  "risky_language",
  "future_validation",
];
