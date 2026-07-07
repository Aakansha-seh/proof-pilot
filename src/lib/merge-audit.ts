import type { ClaimAuditResponse } from "@/lib/schemas";

/**
 * Merge per-chunk audits into one: concatenate + dedupe claims,
 * average the credibility score, and combine risks.
 */
export function mergeAudits(parts: ClaimAuditResponse[]): ClaimAuditResponse {
  if (parts.length === 1) return parts[0];

  const claims: ClaimAuditResponse["claims"] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    for (const c of p.claims) {
      const key = c.claim_text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);
      claims.push({ ...c, id: `claim_${String(claims.length + 1).padStart(3, "0")}` });
    }
  }

  const avg = Math.round(
    parts.reduce((s, p) => s + p.overall_credibility_score, 0) / parts.length
  );
  const risks = Array.from(new Set(parts.flatMap((p) => p.top_risks))).slice(0, 6);

  return {
    overall_credibility_score: avg,
    summary: parts[0].summary,
    top_risks: risks,
    recommended_next_step: parts[0].recommended_next_step,
    claims,
  };
}
