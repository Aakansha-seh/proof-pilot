// Tolerant coercion for the Competitive Intelligence model output.
//
// The IntelModelOutput schema is deeply nested and strict (competitors with
// sources, timeline events, enums, 0-100 scores, timestamps). Models rarely
// return that exact shape, so instead of rejecting slightly-off JSON as
// "malformed", we coerce whatever the model returns into a schema-valid object,
// filling sensible defaults for anything missing. Mirrors coerceAudit for claims.

import type {
  IntelModelOutput,
  Competitor,
  TimelineEvent,
  SourceRecord,
  Whitespace,
  ProofOfDifference,
  ClaimCrossCheck,
} from "./schema";

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, def = ""): string => {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return def;
};
const strArr = (v: unknown): string[] =>
  asArr(v).map((x) => str(x)).filter((s) => s.trim().length > 0);
const clamp = (v: unknown, def = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(0, Math.min(100, Math.round(n)));
};
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], def: T): T => {
  const s = str(v).toLowerCase().trim();
  return (allowed.find((a) => a.toLowerCase() === s) as T) ?? def;
};
const nowIso = () => new Date().toISOString();

const EVENT_TYPES = ["launch", "feature_update", "funding_news", "pricing_change", "hiring", "other"] as const;
const SOURCE_TYPES = ["official_site", "official_blog", "pricing_page", "news", "jobs", "app_store"] as const;
const OVERLAP = ["low", "medium", "high"] as const;
const VERDICT = ["unsupported", "needs_benchmark", "plausible"] as const;

function coerceEvent(v: unknown): TimelineEvent {
  const o = isObj(v) ? v : {};
  const ev: TimelineEvent = {
    title: str(o.title, "Untitled event"),
    date: str(o.date),
    competitor: str(o.competitor),
    eventType: oneOf(o.eventType, EVENT_TYPES, "other"),
  };
  const url = str(o.url);
  if (url) ev.url = url;
  return ev;
}

function coerceSource(v: unknown): SourceRecord {
  const o = isObj(v) ? v : {};
  const rec: SourceRecord = {
    title: str(o.title, "Source"),
    url: str(o.url),
    publisher: str(o.publisher),
    retrievedAt: str(o.retrievedAt) || nowIso(),
    sourceType: oneOf(o.sourceType, SOURCE_TYPES, "news"),
  };
  const publishedAt = str(o.publishedAt);
  if (publishedAt) rec.publishedAt = publishedAt;
  return rec;
}

function coerceCompetitor(v: unknown): Competitor {
  const o = isObj(v) ? v : {};
  const comp: Competitor = {
    name: str(o.name, "Competitor"),
    source: oneOf(o.source, ["user", "ai_suggested"] as const, "ai_suggested"),
    positioning: str(o.positioning),
    targetAudience: str(o.targetAudience),
    pricingModel: str(o.pricingModel),
    coreCapabilities: strArr(o.coreCapabilities),
    recentEvents: asArr(o.recentEvents).map(coerceEvent),
    marketActivitySignal: clamp(o.marketActivitySignal),
    productOverlap: clamp(o.productOverlap),
    overlapSummary: str(o.overlapSummary),
    potentialGap: str(o.potentialGap),
    sources: asArr(o.sources).map(coerceSource),
    lastCheckedAt: str(o.lastCheckedAt) || nowIso(),
  };
  const activityLabel = str(o.activityLabel);
  if (activityLabel) comp.activityLabel = activityLabel;
  return comp;
}

function coerceWhitespace(v: unknown): Whitespace {
  const o = isObj(v) ? v : {};
  return {
    hypothesis: str(o.hypothesis),
    whyOpen: str(o.whyOpen),
    supportingEvidence: str(o.supportingEvidence),
    validationPlan: str(o.validationPlan),
  };
}

function coerceProof(v: unknown): ProofOfDifference {
  const o = isObj(v) ? v : {};
  return {
    differentiator: str(o.differentiator),
    competitorOverlap: oneOf(o.competitorOverlap, OVERLAP, "medium"),
    proofRequired: str(o.proofRequired),
    recommendedAction: str(o.recommendedAction),
    defensibleWording: str(o.defensibleWording),
  };
}

function coerceCrossCheck(v: unknown): ClaimCrossCheck {
  const o = isObj(v) ? v : {};
  const cc: ClaimCrossCheck = {
    claimText: str(o.claimText),
    verdict: oneOf(o.verdict, VERDICT, "needs_benchmark"),
    reasoning: str(o.reasoning),
    saferRewrite: str(o.saferRewrite),
  };
  const claimId = str(o.claimId);
  if (claimId) cc.claimId = claimId;
  const competitorRef = str(o.competitorRef);
  if (competitorRef) cc.competitorRef = competitorRef;
  return cc;
}

/** Coerce arbitrary model JSON into a schema-valid IntelModelOutput. */
export function coerceIntel(input: unknown): IntelModelOutput {
  const o = isObj(input) ? input : {};
  return {
    summary: str(o.summary, "Competitive analysis generated."),
    competitors: asArr(o.competitors).map(coerceCompetitor),
    timeline: asArr(o.timeline).map(coerceEvent),
    whitespace: asArr(o.whitespace).map(coerceWhitespace),
    proofOfDifference: asArr(o.proofOfDifference).map(coerceProof),
    claimCrossCheck: asArr(o.claimCrossCheck).map(coerceCrossCheck),
  };
}
