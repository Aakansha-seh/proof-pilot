import type { ClaimAuditResponse } from "@/lib/schemas";

export const DEMO_PITCH = `ProofPilot is an AI platform that helps every startup create investor-ready pitches in minutes. Our system reduces pitch preparation time by 80%, improves investor conversion by 3x, and has already been validated by hundreds of founders. Unlike ordinary AI tools, ProofPilot guarantees that every claim in a pitch is accurate and investor-safe.`;

export const DEMO_REWRITE = `ProofPilot is an AI platform that helps startups structure clearer, more credible investor pitches faster. In early testing, it's designed to cut the time founders spend organizing and pressure-testing a pitch, and to surface the evidence gaps investors tend to probe. Rather than promising accuracy, ProofPilot flags risky or unsupported language and recommends how to validate each claim — so founders walk into the room knowing exactly what they can defend.`;

// Pre-generated claim-analysis JSON so the demo is reliable even if an API fails.
export const DEMO_AUDIT: ClaimAuditResponse = {
  overall_credibility_score: 42,
  summary:
    "The pitch is compelling and ambitious but leans on several unsupported performance and adoption claims plus absolute guarantee language. Tightening these into measurable, qualified statements would materially raise its credibility.",
  top_risks: [
    "Unverified 80% time-reduction performance claim",
    "Unsupported 3x investor conversion metric",
    "Absolute guarantee that every claim is accurate and investor-safe",
    "Vague 'hundreds of founders' adoption claim with no methodology",
  ],
  recommended_next_step:
    "Run a small structured user study and replace guarantees with measurable, qualified language backed by that data.",
  claims: [
    {
      id: "claim_001",
      claim_text: "Our system reduces pitch preparation time by 80%",
      claim_category: "performance",
      risk_level: "high",
      evidence_status: "unsupported",
      confidence_score: 0.86,
      why_it_matters:
        "Specific performance percentages read as measured results. Without a study behind them, investors discount the whole pitch.",
      evidence_needed: [
        "Before-and-after timing study",
        "Number of users tested",
        "Methodology and sample size",
      ],
      validation_plan: {
        goal: "Measure whether ProofPilot reduces pitch preparation time.",
        method: "Ask 10 users to prepare a pitch with and without ProofPilot.",
        metric: "Average time taken in minutes.",
        success_criteria: "At least 25% reduction in average preparation time.",
      },
      credible_rewrite:
        "In early testing, ProofPilot is designed to reduce the time required to structure and validate a startup pitch.",
      priority: "high",
      group: "risky_language",
    },
    {
      id: "claim_002",
      claim_text: "improves investor conversion by 3x",
      claim_category: "performance",
      risk_level: "high",
      evidence_status: "unsupported",
      confidence_score: 0.83,
      why_it_matters:
        "Conversion multipliers imply a controlled comparison. With no baseline or cohort, this is the easiest claim for an investor to dismiss.",
      evidence_needed: [
        "Baseline conversion rate before ProofPilot",
        "Cohort size and time window",
        "Definition of 'conversion'",
      ],
      validation_plan: {
        goal: "Estimate ProofPilot's effect on investor meeting-to-follow-up rate.",
        method:
          "Track outcomes for a cohort of founders using ProofPilot vs. a comparison group.",
        metric: "Meeting-to-follow-up conversion rate.",
        success_criteria: "A measurable, statistically meaningful lift over baseline.",
      },
      credible_rewrite:
        "ProofPilot aims to help founders present more defensible pitches, which we believe can improve how investors respond.",
      priority: "high",
      group: "needs_evidence",
    },
    {
      id: "claim_003",
      claim_text: "has already been validated by hundreds of founders",
      claim_category: "user_adoption",
      risk_level: "medium",
      evidence_status: "needs_evidence",
      confidence_score: 0.78,
      why_it_matters:
        "'Validated by hundreds' mixes usage with endorsement. Investors will ask what 'validated' means and want the number substantiated.",
      evidence_needed: [
        "Actual count of active users",
        "What 'validated' means (used once? recommended?)",
        "Any testimonials or retention data",
      ],
      validation_plan: {
        goal: "Substantiate the founder adoption claim.",
        method: "Pull real usage analytics and gather explicit user feedback.",
        metric: "Active users and satisfaction/retention rate.",
        success_criteria: "A verifiable user count with documented feedback.",
      },
      credible_rewrite:
        "ProofPilot has been tested with an early group of founders whose feedback is shaping the product.",
      priority: "medium",
      group: "needs_evidence",
    },
    {
      id: "claim_004",
      claim_text:
        "ProofPilot guarantees that every claim in a pitch is accurate and investor-safe",
      claim_category: "guarantee",
      risk_level: "high",
      evidence_status: "unsupported",
      confidence_score: 0.9,
      why_it_matters:
        "Absolute guarantees create legal and credibility risk. No tool can guarantee truth, and sophisticated investors read guarantees as red flags.",
      evidence_needed: [
        "Definition of 'accurate' and 'investor-safe'",
        "Any independent audit of outputs",
      ],
      validation_plan: {
        goal: "Replace the guarantee with a defensible capability statement.",
        method:
          "Document exactly what ProofPilot checks (risk signals, evidence gaps) and its limits.",
        metric: "Coverage of claim types flagged vs. missed in a test set.",
        success_criteria: "A clear, honest description of what the product does and does not do.",
      },
      credible_rewrite:
        "ProofPilot helps founders identify risky or unsupported language and flags where a claim needs stronger evidence before it reaches investors.",
      priority: "high",
      group: "risky_language",
    },
    {
      id: "claim_005",
      claim_text: "helps every startup create investor-ready pitches in minutes",
      claim_category: "vague_marketing",
      risk_level: "medium",
      evidence_status: "partially_supported",
      confidence_score: 0.7,
      why_it_matters:
        "'Every startup' and 'in minutes' are absolutes that overstate scope. Narrowing them makes the promise more believable.",
      evidence_needed: [
        "Typical time-to-first-draft in the product",
        "Which startup stages it fits best",
      ],
      validation_plan: {
        goal: "Define a realistic, honest scope of who benefits and how fast.",
        method: "Measure time-to-usable-draft across a few founder profiles.",
        metric: "Median minutes to a usable first pass.",
        success_criteria: "A concrete, defensible range rather than an absolute.",
      },
      credible_rewrite:
        "ProofPilot helps early-stage founders quickly produce a clearer, more investor-ready first draft.",
      priority: "medium",
      group: "risky_language",
    },
    {
      id: "claim_006",
      claim_text: "Unlike ordinary AI tools, ProofPilot [is different]",
      claim_category: "comparative",
      risk_level: "medium",
      evidence_status: "needs_evidence",
      confidence_score: 0.66,
      why_it_matters:
        "Comparative claims invite a 'compared to what?' question. Naming the specific differentiator is stronger than a vague contrast.",
      evidence_needed: [
        "Named comparison set",
        "The specific, testable differentiator",
      ],
      validation_plan: {
        goal: "Make the differentiation concrete and testable.",
        method: "Compare ProofPilot's evidence-audit output against 2-3 named tools on the same pitch.",
        metric: "Number of risky claims surfaced that others miss.",
        success_criteria: "A demonstrable, repeatable difference in output.",
      },
      credible_rewrite:
        "Unlike general-purpose writing tools, ProofPilot focuses specifically on auditing claims and surfacing evidence gaps.",
      priority: "medium",
      group: "future_validation",
    },
  ],
};
