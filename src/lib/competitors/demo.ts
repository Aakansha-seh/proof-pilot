import type { CompetitiveIntelResponse } from "./schema";

const now = new Date().toISOString();

// Illustrative, source-backed-style demo for the NestEgg fintech scenario.
// Used when no live search provider is configured, or in Demo Mode.
export const DEMO_INTEL: CompetitiveIntelResponse = {
  summary:
    "Reviewed public sources point to a crowded personal-finance space with several active players overlapping NestEgg's positioning. Differentiation on automated, guaranteed outcomes is not defensible against current evidence; the clearer opening is guided, evidence-aware coaching for young professionals.",
  competitors: [
    {
      name: "Cleo",
      source: "ai_suggested",
      positioning: "AI chat-based budgeting assistant with a playful tone.",
      targetAudience: "Gen Z and young millennials in the US/UK.",
      pricingModel: "Freemium with a paid subscription tier.",
      coreCapabilities: [
        "Conversational budgeting",
        "Spending insights",
        "Cash advances",
      ],
      recentEvents: [
        {
          title: "Expanded AI assistant features",
          date: "2025-02-01",
          competitor: "Cleo",
          url: "https://web.meetcleo.com/blog",
          eventType: "feature_update",
        },
      ],
      marketActivitySignal: 72,
      productOverlap: 68,
      overlapSummary:
        "Overlaps on AI-driven budgeting for young users; differs in NestEgg's savings-growth framing.",
      potentialGap:
        "Cleo focuses on day-to-day spending, not long-horizon savings coaching.",
      sources: [
        {
          title: "Cleo blog",
          url: "https://web.meetcleo.com/blog",
          publisher: "meetcleo.com",
          publishedAt: "2025-02-01",
          retrievedAt: now,
          sourceType: "official_blog",
        },
      ],
      lastCheckedAt: now,
    },
    {
      name: "Copilot Money",
      source: "ai_suggested",
      positioning: "Premium personal finance tracker with a polished UX.",
      targetAudience: "Design-conscious professionals on iOS/Mac.",
      pricingModel: "Paid subscription (annual/monthly).",
      coreCapabilities: [
        "Automated categorization",
        "Net-worth tracking",
        "Budgets and insights",
      ],
      recentEvents: [
        {
          title: "New categorization model release",
          date: "2024-11-15",
          competitor: "Copilot Money",
          url: "https://copilot.money/",
          eventType: "feature_update",
        },
      ],
      marketActivitySignal: 61,
      productOverlap: 54,
      overlapSummary:
        "Strong tracking overlap; less focus on coaching or guaranteed outcomes.",
      potentialGap:
        "No evidence-linked coaching for pitch/goal validation.",
      sources: [
        {
          title: "Copilot Money",
          url: "https://copilot.money/",
          publisher: "copilot.money",
          retrievedAt: now,
          sourceType: "official_site",
        },
      ],
      lastCheckedAt: now,
    },
    {
      name: "Origin",
      source: "ai_suggested",
      positioning: "Holistic financial planning and wealth app.",
      targetAudience: "Working professionals seeking planning + investing.",
      pricingModel: "Subscription; employer-sponsored tiers.",
      coreCapabilities: ["Financial planning", "Investing", "Tax tools"],
      recentEvents: [],
      marketActivitySignal: 40,
      productOverlap: 45,
      overlapSummary:
        "Adjacent planning focus; broader scope than NestEgg's coaching wedge.",
      potentialGap:
        "Planning-heavy, not tailored to first-time young savers.",
      activityLabel: "Limited recent public activity found in reviewed sources.",
      sources: [],
      lastCheckedAt: now,
    },
  ],
  timeline: [
    {
      title: "Cleo expanded AI assistant features",
      date: "2025-02-01",
      competitor: "Cleo",
      url: "https://web.meetcleo.com/blog",
      eventType: "feature_update",
    },
    {
      title: "Copilot Money released a new categorization model",
      date: "2024-11-15",
      competitor: "Copilot Money",
      url: "https://copilot.money/",
      eventType: "feature_update",
    },
  ],
  whitespace: [
    {
      hypothesis:
        "Potential whitespace: evidence-aware financial coaching for young first-time savers, focused on credibility rather than guarantees.",
      whyOpen:
        "Reviewed competitors emphasize tracking and budgeting, not validated, evidence-linked coaching outcomes.",
      supportingEvidence:
        "Cleo and Copilot source pages center on spending insights and tracking; none advertise validated outcome guarantees.",
      mustValidate:
        "Run a 10-user study measuring whether coaching changes savings behavior versus a control.",
    },
  ],
  proofOfDifference: [
    {
      differentiator: "Evidence-linked coaching (no outcome guarantees)",
      competitorOverlap: "medium",
      proofRequired: "A before/after behavior study with a real cohort.",
      recommendedAction: "Ship a 5-10 user validation test and publish the method.",
      defensibleWording:
        "NestEgg focuses on evidence-aware coaching that helps young professionals build savings habits — measured, not guaranteed.",
    },
  ],
  claimCrossCheck: [
    {
      claimText: "grows your savings by 40% in the first three months — guaranteed",
      verdict: "unsupported",
      reasoning:
        "No public source establishes a 40% outcome, and no user benchmark was supplied. Guarantee language is not defensible.",
      saferRewrite:
        "In early testing, NestEgg is designed to help users increase their savings rate; results vary by user.",
    },
    {
      claimText: "our proprietary AI is 10x more accurate than other budgeting apps",
      competitorRef: "Cleo, Copilot Money",
      verdict: "needs_benchmark",
      reasoning:
        "Competitors reviewed do not publish accuracy figures, and no shared benchmark was provided, so a 10x comparison cannot be supported.",
      saferRewrite:
        "NestEgg aims to deliver accurate cash-flow predictions; we are benchmarking against leading budgeting apps.",
    },
  ],
  meta: {
    competitorsAnalyzed: 3,
    analysisDurationMs: 0,
    usedAmd: false,
    providerUsed: "demo",
    searchProvider: "demo",
    sourcesReviewed: 4,
    generatedAt: now,
  },
};
