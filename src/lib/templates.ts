export type InputTemplate = {
  id: string;
  label: string;
  hint: string;
  seed: string;
};

export const INPUT_TEMPLATES: InputTemplate[] = [
  {
    id: "startup_pitch",
    label: "Startup Pitch",
    hint: "Investor-facing narrative and metrics",
    seed:
      "We are building [product], the [category] for [audience]. Today, [problem]. Our platform [solution]. We've grown to [traction] and reduce [metric] by [amount]. Our market is [TAM] and we are raising [amount] to [use of funds].",
  },
  {
    id: "hackathon_submission",
    label: "Hackathon Submission",
    hint: "Devpost-style project write-up",
    seed:
      "Our project [name] solves [problem] using [tech]. Inspiration: [why]. What it does: [features]. How we built it: [stack]. It processes [scale] and is [x]% faster than [baseline]. What's next: [roadmap].",
  },
  {
    id: "project_report",
    label: "Project Report",
    hint: "Academic or internal results report",
    seed:
      "This report presents [project]. Objective: [goal]. Methodology: [method]. Results: we observed [result] with [metric]. Our approach outperforms [baseline] by [amount]. Conclusion: [claim].",
  },
  {
    id: "grant_application",
    label: "Grant Application",
    hint: "Funding proposal with impact claims",
    seed:
      "We request [amount] to [objective]. The problem affects [population]. Our intervention [approach] will improve [outcome] by [amount] within [timeframe]. Prior work shows [evidence]. Expected impact: [claim].",
  },
  {
    id: "freelancer_proposal",
    label: "Freelancer Proposal",
    hint: "Client-facing services proposal",
    seed:
      "I help [clients] achieve [outcome]. In past projects I delivered [result], increasing [metric] by [amount]. My process: [steps]. For your project I will [deliverables] within [timeline], guaranteeing [promise].",
  },
];
