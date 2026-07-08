import { ClaimAuditResponse, ClaimGroup, RiskLevel } from "@/lib/schemas";

const CATEGORIES = [
  "factual","performance","market","user_adoption","technical",
  "comparative","guarantee","future_projection","vague_marketing",
] as const;
const RISKS = ["low","medium","high"] as const;
const STATUSES = ["supported","partially_supported","unsupported","needs_evidence"] as const;
const PRIORITIES = ["low","medium","high"] as const;

function str(v: unknown, d = ""): string {
  return typeof v === "string" ? v : v == null ? d : String(v);
}
function strArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => str(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}
function pick<T extends readonly string[]>(v: unknown, allowed: T, d: T[number]): T[number] {
  const s = str(v).toLowerCase().replace(/[\s-]+/g, "_");
  if ((allowed as readonly string[]).includes(s)) return s as T[number];
  // light synonym mapping
  if (allowed === (CATEGORIES as readonly string[])) {
    if (/adopt|user|traction|customer/.test(s)) return "user_adoption" as T[number];
    if (/project|future|forecast/.test(s)) return "future_projection" as T[number];
    if (/market|buzz|vague/.test(s) && allowed.includes("vague_marketing")) {
      if (/vague|buzz|fluff/.test(s)) return "vague_marketing" as T[number];
      return "market" as T[number];
    }
    if (/perf|speed|accuracy/.test(s)) return "performance" as T[number];
    if (/guarantee|promise/.test(s)) return "guarantee" as T[number];
    if (/compar|better|versus|vs/.test(s)) return "comparative" as T[number];
    if (/tech/.test(s)) return "technical" as T[number];
  }
  if (allowed === (STATUSES as readonly string[])) {
    if (/partial/.test(s)) return "partially_supported" as T[number];
    if (/unsupport|no|none|missing/.test(s)) return "unsupported" as T[number];
    if (/support|proven|verified/.test(s)) return "supported" as T[number];
  }
  return d;
}
function num01(v: unknown, d = 0.5): number {
  const n = typeof v === "number" ? v : parseFloat(str(v));
  if (Number.isNaN(n)) return d;
  return Math.min(1, Math.max(0, n > 1 ? n / 100 : n));
}
function score100(v: unknown, d = 50): number {
  const n = typeof v === "number" ? v : parseFloat(str(v));
  if (Number.isNaN(n)) return d;
  return Math.round(Math.min(100, Math.max(0, n <= 1 ? n * 100 : n)));
}

function deriveGroup(risk: RiskLevel, status: string): ClaimGroup {
  if (status === "supported") return "proven";
  if (risk === "high") return "risky_language";
  if (status === "needs_evidence" || status === "unsupported") return "needs_evidence";
  return "future_validation";
}

/**
 * Tolerant coercion: turn arbitrary model JSON into a valid ClaimAuditResponse,
 * filling sensible defaults so minor deviations never crash the audit.
 */
export function coerceAudit(raw: unknown): ClaimAuditResponse {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawClaims: unknown[] = Array.isArray(o.claims)
    ? o.claims
    : Array.isArray(raw)
    ? (raw as unknown[])
    : [];

  const claims = rawClaims
    .filter((c) => c && typeof c === "object")
    .map((cu, i) => {
      const c = cu as Record<string, unknown>;
      const risk = pick(c.risk_level, RISKS, "medium");
      const status = pick(c.evidence_status, STATUSES, "needs_evidence");
      const vp = (c.validation_plan && typeof c.validation_plan === "object"
        ? c.validation_plan
        : {}) as Record<string, unknown>;
      const groupRaw = str(c.group).toLowerCase().replace(/[\s-]+/g, "_");
      const group: ClaimGroup = (
        ["proven", "needs_evidence", "risky_language", "future_validation"].includes(groupRaw)
          ? groupRaw
          : deriveGroup(risk, status)
      ) as ClaimGroup;
      return {
        id: str(c.id) || `claim_${String(i + 1).padStart(3, "0")}`,
        claim_text: str(c.claim_text || c.text || c.claim),
        claim_category: pick(c.claim_category || c.category, CATEGORIES, "factual"),
        risk_level: risk,
        evidence_status: status,
        confidence_score: num01(c.confidence_score),
        why_it_matters: str(c.why_it_matters),
        evidence_needed: strArr(c.evidence_needed),
        validation_plan: {
          goal: str(vp.goal),
          method: str(vp.method),
          metric: str(vp.metric),
          success_criteria: str(vp.success_criteria || vp.success),
        },
        credible_rewrite: str(c.credible_rewrite || c.rewrite),
        priority: pick(c.priority, PRIORITIES, risk),
        group,
      };
    })
    .filter((c) => c.claim_text.length > 0);

  return {
    overall_credibility_score: score100(o.overall_credibility_score ?? o.credibility_score),
    summary: str(o.summary),
    top_risks: strArr(o.top_risks),
    recommended_next_step: str(o.recommended_next_step || o.next_step),
    claims,
  };
}

/** Back-compat: normalize an already-typed audit. */
export function normalizeAudit(audit: ClaimAuditResponse): ClaimAuditResponse {
  return coerceAudit(audit);
}
