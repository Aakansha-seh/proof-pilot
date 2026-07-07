import type {
  Competitor,
  CompetitiveIntelResponse,
  ClaimCrossCheck,
} from "./schema";

export type Quadrant =
  | "direct_threat"
  | "adjacent"
  | "watch_closely"
  | "low_priority";

export const QUADRANT_META: Record<
  Quadrant,
  { label: string; token: string; desc: string }
> = {
  direct_threat: {
    label: "Direct threat",
    token: "--risk",
    desc: "High overlap and high market activity",
  },
  adjacent: {
    label: "Adjacent player",
    token: "--future",
    desc: "Lower overlap but strong market momentum",
  },
  watch_closely: {
    label: "Watch closely",
    token: "--warn",
    desc: "High overlap but lower current activity",
  },
  low_priority: {
    label: "Low priority",
    token: "--muted-foreground",
    desc: "Lower overlap and lower market activity",
  },
};

export function quadrantOf(overlap: number, activity: number): Quadrant {
  const hiOverlap = overlap >= 50;
  const hiActivity = activity >= 50;
  if (hiOverlap && hiActivity) return "direct_threat";
  if (!hiOverlap && hiActivity) return "adjacent";
  if (hiOverlap && !hiActivity) return "watch_closely";
  return "low_priority";
}

// ---------------------------------------------------------------------------
// Evidence coverage — how well-sourced this run is (drives confidence chips).
// ---------------------------------------------------------------------------
export type Coverage = "low" | "medium" | "high";

export function coverageOf(intel: CompetitiveIntelResponse): Coverage {
  const n = intel.competitors.length || 1;
  const avgSources =
    intel.competitors.reduce((s, c) => s + c.sources.length, 0) / n;
  if (avgSources >= 2) return "high";
  if (avgSources >= 1) return "medium";
  return "low";
}

export const COVERAGE_LABEL: Record<Coverage, string> = {
  low: "Low evidence coverage",
  medium: "Moderate evidence coverage",
  high: "Strong evidence coverage",
};

// A competitor needs a "Verify" badge when AI-suggested or thinly sourced.
export function needsVerify(c: Competitor): boolean {
  return c.source === "ai_suggested" || c.sources.length === 0;
}

// ---------------------------------------------------------------------------
// Executive decision strip (derived client-side from existing intel data).
// ---------------------------------------------------------------------------
export type Decision = {
  outlook: string;
  primaryThreat: string;
  primaryThreatName: string | null;
  bestWedge: string;
  nextProof: string;
  positioningStatement: string;
};

export function primaryThreatOf(competitors: Competitor[]): Competitor | null {
  if (competitors.length === 0) return null;
  return [...competitors].sort(
    (a, b) =>
      b.productOverlap - a.productOverlap ||
      b.marketActivitySignal - a.marketActivitySignal
  )[0];
}

export function buildDecision(intel: CompetitiveIntelResponse): Decision {
  const comps = intel.competitors;
  const insight = buildInsight(comps);
  const threat = primaryThreatOf(comps);
  const ws = intel.whitespace[0];
  const pod = intel.proofOfDifference[0];

  let outlook: string;
  if (insight.counts.direct_threat >= 1) {
    outlook = "Contested space — differentiation must be proven, not asserted.";
  } else if (insight.counts.watch_closely >= 1) {
    outlook = "Defensible opening, but differentiation is still emerging.";
  } else {
    outlook = "Open field based on reviewed sources — move to validate the wedge.";
  }

  const primaryThreat = threat
    ? `${threat.name} has the highest product overlap in reviewed sources and could become a direct threat if it expands toward your positioning.`
    : "No high-overlap competitor identified in reviewed sources.";

  const bestWedge =
    ws?.hypothesis ||
    pod?.differentiator ||
    "Potential differentiation hypothesis based on reviewed sources.";

  const nextProof =
    pod?.proofRequired ||
    ws?.mustValidate ||
    "Run a small user validation test and compare your workflow against an existing tool.";

  const positioningStatement =
    pod?.defensibleWording ||
    (ws ? `Positioning hypothesis: ${ws.hypothesis}` : bestWedge);

  return {
    outlook,
    primaryThreat,
    primaryThreatName: threat?.name ?? null,
    bestWedge,
    nextProof,
    positioningStatement,
  };
}

// ---------------------------------------------------------------------------
// Strategic insight cards (replace the long market narrative).
// ---------------------------------------------------------------------------
export type StrategicInsight = {
  key: "market_signal" | "competitive_pattern" | "strategic_opening";
  title: string;
  text: string;
};

export function buildStrategicInsights(
  intel: CompetitiveIntelResponse
): StrategicInsight[] {
  const comps = intel.competitors;
  const n = comps.length;
  const quiet = comps.filter((c) => c.activityLabel).length;
  const activityNote =
    quiet >= Math.ceil(n / 2)
      ? "Recent public activity is limited across the reviewed competitor set."
      : "Several show recent public activity in reviewed sources.";

  const ws = intel.whitespace[0];
  const pod = intel.proofOfDifference[0];

  return [
    {
      key: "market_signal",
      title: "Market signal",
      text: `${n} relevant tool${n === 1 ? "" : "s"} identified in reviewed sources. ${activityNote}`,
    },
    {
      key: "competitive_pattern",
      title: "Competitive pattern",
      text:
        ws?.whyOpen ||
        "Based on reviewed sources, alternatives cluster around similar positioning; evidence validation appears under-addressed (hypothesis).",
    },
    {
      key: "strategic_opening",
      title: "Strategic opening",
      text:
        ws?.hypothesis ||
        pod?.defensibleWording ||
        "Evidence-aware, judge-ready claim auditing appears to be the clearest differentiation hypothesis.",
    },
  ];
}

// ---------------------------------------------------------------------------
// Strategy meta (differentiation / overlap / defensibility / moat).
// ---------------------------------------------------------------------------
export type Defensibility = "Weak" | "Emerging" | "Strong";

export type StrategyMeta = {
  differentiation: string;
  overlap: "Low" | "Medium" | "High";
  defensibility: Defensibility;
  moat: string;
};

export function buildStrategyMeta(
  intel: CompetitiveIntelResponse
): StrategyMeta {
  const comps = intel.competitors;
  const pod = intel.proofOfDifference[0];
  const avgOverlap =
    comps.reduce((s, c) => s + c.productOverlap, 0) / (comps.length || 1);
  const threats = comps.filter(
    (c) => quadrantOf(c.productOverlap, c.marketActivitySignal) === "direct_threat"
  ).length;

  const overlap: StrategyMeta["overlap"] =
    pod?.competitorOverlap === "high"
      ? "High"
      : pod?.competitorOverlap === "low"
      ? "Low"
      : avgOverlap >= 60
      ? "High"
      : avgOverlap >= 35
      ? "Medium"
      : "Low";

  let defensibility: Defensibility;
  if (threats >= 1 && overlap === "High") defensibility = "Weak";
  else if (overlap === "Low" && threats === 0) defensibility = "Emerging";
  else defensibility = "Emerging";

  const moat =
    defensibility === "Weak"
      ? "None yet — validate a workflow or proprietary-data advantage before claiming a moat."
      : "Workflow depth (hypothesis) — needs validation with real users.";

  return {
    differentiation:
      pod?.differentiator ||
      "Evidence-linked claim auditing (differentiation hypothesis).",
    overlap,
    defensibility,
    moat,
  };
}

// ---------------------------------------------------------------------------
// Validation checklist (derived from proof-of-difference + whitespace).
// ---------------------------------------------------------------------------
export type ChecklistItem = {
  text: string;
  proofType: string;
  priority: "low" | "medium" | "high";
  owner: string;
  effort: string;
};

export function buildChecklist(
  intel: CompetitiveIntelResponse
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  for (const p of intel.proofOfDifference) {
    items.push({
      text: p.proofRequired,
      proofType: "Evidence",
      priority:
        p.competitorOverlap === "high"
          ? "high"
          : p.competitorOverlap === "medium"
          ? "medium"
          : "low",
      owner: "Founder",
      effort: "~1 week",
    });
    if (p.recommendedAction) {
      items.push({
        text: p.recommendedAction,
        proofType: "Action",
        priority: "medium",
        owner: "Team",
        effort: "~1 week",
      });
    }
  }
  for (const w of intel.whitespace) {
    items.push({
      text: w.mustValidate,
      proofType: "Validation",
      priority: "high",
      owner: "Founder",
      effort: "~1-2 weeks",
    });
  }
  // Cap to keep the checklist scannable.
  return items.slice(0, 6);
}

// Order claim stress-tests by severity so the riskiest shows first.
export function verdictSeverity(v: ClaimCrossCheck["verdict"]): number {
  return v === "unsupported" ? 3 : v === "needs_benchmark" ? 2 : 1;
}

// ---------------------------------------------------------------------------
// Quadrant counts + headline (kept for the hero / decision context).
// ---------------------------------------------------------------------------
export type Insight = {
  headline: string;
  recommendation: string;
  counts: Record<Quadrant, number>;
};

export function buildInsight(competitors: Competitor[]): Insight {
  const counts: Record<Quadrant, number> = {
    direct_threat: 0,
    adjacent: 0,
    watch_closely: 0,
    low_priority: 0,
  };
  for (const c of competitors) {
    counts[quadrantOf(c.productOverlap, c.marketActivitySignal)]++;
  }

  const threats = counts.direct_threat;
  const total = competitors.length || 1;
  const avgOverlap =
    competitors.reduce((s, c) => s + c.productOverlap, 0) / total;

  let headline: string;
  if (threats >= 2) {
    headline = `${threats} direct threats are active in your space, based on reviewed sources.`;
  } else if (threats === 1) {
    headline = "One direct threat is active — the rest of the field looks beatable.";
  } else if (counts.watch_closely >= 1) {
    headline = `No active head-on threat, but ${counts.watch_closely} overlapping player${
      counts.watch_closely > 1 ? "s" : ""
    } could re-activate.`;
  } else {
    headline = "The field is quiet or aimed elsewhere in reviewed sources — a real opening exists.";
  }

  const recommendation =
    avgOverlap >= 55
      ? "Overlap is high — your edge has to come from a defensible difference, not features. Prove it."
      : "Overlap is low — lean into differentiation and move fast before an adjacent player pivots toward you.";

  return { headline, recommendation, counts };
}
