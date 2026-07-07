import type { ClaimAuditResponse, EvidencePackResponse } from "@/lib/schemas";

/** Derive an Evidence Pack locally from an audit (offline fallback for the API). */
export function deriveLocalPack(audit: ClaimAuditResponse): EvidencePackResponse {
  const weak = audit.claims
    .filter((c) => c.evidence_status !== "supported")
    .sort((a, b) => rank(b.priority) - rank(a.priority));

  const roadmap = weak.slice(0, 6).map((c) => ({
    claim_ref: c.id,
    action: c.validation_plan.method,
    metric: c.validation_plan.metric,
    timeframe: c.priority === "high" ? "Week 1" : "Weeks 2-3",
  }));

  const next7 = [
    `Prioritize the ${weak.filter((c) => c.risk_level === "high").length} highest-risk claims and rewrite their language today.`,
    ...weak.slice(0, 4).map((c) => `Test: ${c.validation_plan.goal}`),
    "Compile evidence into the Evidence Pack and share with a mentor for review.",
  ];

  return {
    executive_summary: audit.summary,
    evidence_gap_analysis: `${weak.length} of ${audit.claims.length} claims currently lack sufficient support. The most pressing gaps concern ${audit.top_risks
      .slice(0, 3)
      .join(", ")}. Addressing these with the validation steps below is the fastest route to a higher credibility score.`,
    validation_roadmap: roadmap,
    next_7_days: next7,
  };
}

function rank(p: string): number {
  return p === "high" ? 3 : p === "medium" ? 2 : 1;
}
