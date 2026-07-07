import { ClaimAuditResponse, ClaimGroup, RiskLevel } from "@/lib/schemas";

/**
 * Light post-processing to keep the UI resilient even when a model returns
 * slightly inconsistent enums or a missing group. Never fabricates content.
 */
export function normalizeAudit(audit: ClaimAuditResponse): ClaimAuditResponse {
  const claims = audit.claims.map((c, i) => {
    let group: ClaimGroup = c.group;
    if (!group) group = deriveGroup(c.risk_level, c.evidence_status);
    return {
      ...c,
      id: c.id || `claim_${String(i + 1).padStart(3, "0")}`,
      group,
      confidence_score: clamp01(c.confidence_score),
    };
  });

  return {
    ...audit,
    overall_credibility_score: Math.round(
      Math.min(100, Math.max(0, audit.overall_credibility_score))
    ),
    claims,
  };
}

function deriveGroup(
  risk: RiskLevel,
  status: string
): ClaimGroup {
  if (status === "supported") return "proven";
  if (risk === "high") return "risky_language";
  if (status === "needs_evidence" || status === "unsupported")
    return "needs_evidence";
  return "future_validation";
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}
