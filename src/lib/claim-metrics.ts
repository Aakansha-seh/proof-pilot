import type { Claim, ClaimAuditResponse } from "@/lib/schemas";

const EV_SCORE: Record<string, number> = {
  supported: 1,
  partially_supported: 0.6,
  needs_evidence: 0.3,
  unsupported: 0.1,
};
const RISK_PENALTY: Record<string, number> = { low: 0, medium: 0.5, high: 1 };

export type ScoreComponent = { label: string; value: number; max: number };

// Derive a 3-part breakdown that sums to the model's overall score, so the
// gauge feels explained rather than arbitrary.
export function scoreBreakdown(audit: ClaimAuditResponse): ScoreComponent[] {
  const claims = audit.claims;
  const n = claims.length || 1;
  const e = claims.reduce((s, c) => s + (EV_SCORE[c.evidence_status] ?? 0.3), 0) / n;
  const l = 1 - claims.reduce((s, c) => s + (RISK_PENALTY[c.risk_level] ?? 0.5), 0) / n;
  const q = claims.reduce((s, c) => s + c.confidence_score, 0) / n;

  const maxes = [35, 30, 35];
  const raw = [e * maxes[0], l * maxes[1], q * maxes[2]];
  const rawSum = raw.reduce((a, b) => a + b, 0) || 1;
  const scale = audit.overall_credibility_score / rawSum;
  const vals = raw.map((r, i) => Math.max(0, Math.min(maxes[i], Math.round(r * scale))));

  return [
    { label: "Evidence coverage", value: vals[0], max: 35 },
    { label: "Language risk", value: vals[1], max: 30 },
    { label: "Claim quality", value: vals[2], max: 35 },
  ];
}

export type AuditHealth = {
  supported: number;
  risky: number;
  needEvidence: number;
  proven: number;
  total: number;
};

export function auditHealth(audit: ClaimAuditResponse): AuditHealth {
  const claims = audit.claims;
  return {
    supported: claims.filter((c) => c.evidence_status === "supported").length,
    risky: claims.filter((c) => c.group === "risky_language" || c.risk_level === "high").length,
    needEvidence: claims.filter((c) => c.group === "needs_evidence").length,
    proven: claims.filter((c) => c.group === "proven").length,
    total: claims.length,
  };
}

// A single risk percentage for scannable card indicators.
export function claimRiskPercent(c: Claim): number {
  const base = c.risk_level === "high" ? 88 : c.risk_level === "medium" ? 55 : 20;
  // nudge by confidence so cards aren't all identical
  return Math.round(Math.min(98, Math.max(5, base + (c.confidence_score - 0.5) * 12)));
}

export function highestRiskClaim(audit: ClaimAuditResponse): Claim | null {
  if (audit.claims.length === 0) return null;
  return [...audit.claims].sort((a, b) => claimRiskPercent(b) - claimRiskPercent(a))[0];
}

// Coordinates (0-100) for the Claim Confidence Matrix.
export function matrixPoint(c: Claim): { x: number; y: number } {
  const x =
    c.evidence_status === "supported"
      ? 88
      : c.evidence_status === "partially_supported"
      ? 60
      : c.evidence_status === "needs_evidence"
      ? 35
      : 15; // evidence strength
  const y = c.risk_level === "high" ? 85 : c.risk_level === "medium" ? 55 : 22; // risk
  return { x, y };
}
