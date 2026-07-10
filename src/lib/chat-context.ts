// Serializes a single audit's analysis into a compact text block that grounds
// the ProofPilot Mentor chat. The mentor is only allowed to use what these
// builders return, so each page passes only the data relevant to its audit.

import type { SavedAudit } from "@/lib/schemas";

function truncate(value: string | undefined, max = 500): string {
  if (!value) return "";
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

/**
 * Build the mentor context for the audit workspace page.
 * Includes the claim audit and, when it has been generated, the competitive
 * intelligence for THIS audit — nothing from any other audit.
 */
export function buildAuditContext(audit: SavedAudit): string {
  const a = audit.audit;
  const lines: string[] = [];

  lines.push(`AUDIT TITLE: ${audit.title}`);
  lines.push(`OVERALL CREDIBILITY SCORE: ${a.overall_credibility_score}/100`);
  if (a.summary) lines.push(`SUMMARY: ${truncate(a.summary, 700)}`);

  if (a.top_risks?.length) {
    lines.push("");
    lines.push("TOP RISKS:");
    a.top_risks.forEach((r, i) => lines.push(`  ${i + 1}. ${truncate(r, 300)}`));
  }

  if (a.recommended_next_step) {
    lines.push("");
    lines.push(`RECOMMENDED NEXT STEP: ${truncate(a.recommended_next_step, 400)}`);
  }

  if (a.claims?.length) {
    lines.push("");
    lines.push(`CLAIMS (${a.claims.length}):`);
    a.claims.forEach((c, i) => {
      lines.push(
        `  [${i + 1}] "${truncate(c.claim_text, 220)}"`
      );
      lines.push(
        `      category=${c.claim_category}; risk=${c.risk_level}; evidence=${c.evidence_status}; group=${c.group}; confidence=${Math.round(
          c.confidence_score * 100
        )}%`
      );
      if (c.why_it_matters) lines.push(`      why_it_matters: ${truncate(c.why_it_matters, 220)}`);
      if (c.evidence_needed?.length)
        lines.push(`      evidence_needed: ${c.evidence_needed.map((e) => truncate(e, 120)).join("; ")}`);
      if (c.credible_rewrite) lines.push(`      credible_rewrite: ${truncate(c.credible_rewrite, 220)}`);
    });
  }

  const intel = audit.competitiveIntel;
  if (intel) {
    lines.push("");
    lines.push("=== COMPETITIVE INTELLIGENCE ===");
    if (intel.summary) lines.push(`INTEL SUMMARY: ${truncate(intel.summary, 700)}`);

    if (intel.competitors?.length) {
      lines.push("");
      lines.push(`COMPETITORS (${intel.competitors.length}):`);
      intel.competitors.forEach((comp, i) => {
        lines.push(`  [${i + 1}] ${comp.name} (${comp.source})`);
        if (comp.positioning) lines.push(`      positioning: ${truncate(comp.positioning, 220)}`);
        if (comp.targetAudience) lines.push(`      target: ${truncate(comp.targetAudience, 160)}`);
        if (comp.pricingModel) lines.push(`      pricing: ${truncate(comp.pricingModel, 160)}`);
        lines.push(
          `      productOverlap=${comp.productOverlap}/100; marketActivitySignal=${comp.marketActivitySignal}/100`
        );
        if (comp.overlapSummary) lines.push(`      overlap: ${truncate(comp.overlapSummary, 220)}`);
        if (comp.potentialGap) lines.push(`      gap: ${truncate(comp.potentialGap, 220)}`);
      });
    }

    if (intel.whitespace?.length) {
      lines.push("");
      lines.push("WHITESPACE OPPORTUNITIES:");
      intel.whitespace.forEach((w, i) =>
        lines.push(`  ${i + 1}. ${truncate(w.hypothesis, 220)} — why open: ${truncate(w.whyOpen, 160)}`)
      );
    }

    if (intel.proofOfDifference?.length) {
      lines.push("");
      lines.push("PROOF OF DIFFERENCE:");
      intel.proofOfDifference.forEach((p, i) =>
        lines.push(
          `  ${i + 1}. ${truncate(p.differentiator, 200)} (overlap=${p.competitorOverlap}); proof required: ${truncate(
            p.proofRequired,
            160
          )}`
        )
      );
    }
  } else {
    lines.push("");
    lines.push("COMPETITIVE INTELLIGENCE: not generated for this audit yet.");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Analyze-startup page context
// ---------------------------------------------------------------------------
export type StartupAnalysis = {
  summary?: string;
  competitorAnalysis?: Array<{ name?: string; description?: string; strength?: string }>;
  marketResearch?: { marketSize?: string; targetAudience?: string; industryTrend?: string };
  riskAssessment?: string[];
  evidenceValidation?: Array<{
    claim?: string;
    status?: string;
    reason?: string;
    explanation?: string;
    reasoning?: string;
  }>;
  pitchImprovements?: string[];
};

export type StartupMeta = {
  startupName?: string;
  oneLineIdea?: string;
  problemStatement?: string;
  targetAudience?: string;
  industry?: string;
  revenueModel?: string;
  startupStage?: string;
};

/**
 * Build the mentor context for the analyze-startup page from the generated
 * validation report and the entered startup details.
 */
export function buildStartupContext(analysis: StartupAnalysis, meta: StartupMeta): string {
  const lines: string[] = [];

  lines.push("STARTUP VALIDATION REPORT");
  if (meta.startupName) lines.push(`STARTUP NAME: ${meta.startupName}`);
  if (meta.oneLineIdea) lines.push(`ONE-LINE IDEA: ${truncate(meta.oneLineIdea, 240)}`);
  if (meta.problemStatement) lines.push(`PROBLEM: ${truncate(meta.problemStatement, 400)}`);
  if (meta.targetAudience) lines.push(`TARGET AUDIENCE: ${truncate(meta.targetAudience, 200)}`);
  if (meta.industry) lines.push(`INDUSTRY: ${meta.industry}`);
  if (meta.revenueModel) lines.push(`REVENUE MODEL: ${meta.revenueModel}`);
  if (meta.startupStage) lines.push(`STAGE: ${meta.startupStage}`);

  if (analysis.summary) {
    lines.push("");
    lines.push(`SUMMARY: ${truncate(analysis.summary, 700)}`);
  }

  if (analysis.competitorAnalysis?.length) {
    lines.push("");
    lines.push(`COMPETITOR ANALYSIS (${analysis.competitorAnalysis.length}):`);
    analysis.competitorAnalysis.forEach((c, i) => {
      lines.push(`  [${i + 1}] ${c.name || "Competitor"}`);
      if (c.description) lines.push(`      ${truncate(c.description, 240)}`);
      if (c.strength) lines.push(`      strength: ${truncate(c.strength, 160)}`);
    });
  }

  if (analysis.marketResearch) {
    const m = analysis.marketResearch;
    lines.push("");
    lines.push("MARKET RESEARCH:");
    if (m.marketSize) lines.push(`  market size: ${truncate(m.marketSize, 200)}`);
    if (m.targetAudience) lines.push(`  target audience: ${truncate(m.targetAudience, 200)}`);
    if (m.industryTrend) lines.push(`  industry trend: ${truncate(m.industryTrend, 200)}`);
  }

  if (analysis.riskAssessment?.length) {
    lines.push("");
    lines.push("RISK ASSESSMENT:");
    analysis.riskAssessment.forEach((r, i) => lines.push(`  ${i + 1}. ${truncate(r, 240)}`));
  }

  if (analysis.evidenceValidation?.length) {
    lines.push("");
    lines.push("EVIDENCE VALIDATION:");
    analysis.evidenceValidation.forEach((e, i) => {
      lines.push(`  [${i + 1}] ${truncate(e.claim || "Claim", 200)}`);
      const reason = e.reason || e.explanation || e.reasoning;
      if (reason) lines.push(`      ${truncate(reason, 240)}`);
      if (e.status) lines.push(`      status: ${e.status}`);
    });
  }

  if (analysis.pitchImprovements?.length) {
    lines.push("");
    lines.push("PITCH IMPROVEMENTS:");
    analysis.pitchImprovements.forEach((p, i) => lines.push(`  ${i + 1}. ${truncate(p, 240)}`));
  }

  return lines.join("\n");
}
