import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const startupName = typeof body?.startupName === "string" ? body.startupName.trim() : "";
    const problemStatement = typeof body?.problemStatement === "string" ? body.problemStatement.trim() : "";
    const analysisOptions = Array.isArray(body?.analysisOptions)
      ? body.analysisOptions.filter((item: unknown): item is string => typeof item === "string")
      : [];

    const errors: Record<string, string> = {};

    if (!startupName) {
      errors.startupName = "Startup Name is required.";
    }

    if (!problemStatement) {
      errors.problemStatement = "Problem Statement is required.";
    }

    if (analysisOptions.length === 0) {
      errors.analysisOptions = "At least one analysis option is required.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors,
        },
        { status: 400 }
      );
    }

    const prompt = [
      "You are an experienced startup advisor, venture capitalist, product strategist, and market researcher.",
      "Act as if you are performing investor-grade startup due diligence for a prospective fundraising or acceleration review.",
      "Analyze the startup with realism, business judgment, and strong market intuition.",
      "Read every detail provided by the user and form a nuanced assessment of the startup opportunity.",
      "Identify likely real competitors when possible using your general knowledge, but do not invent competitors or make up company specifics.",
      "When the information is insufficient, prefer a careful, evidence-based statement such as 'Unknown' or 'Insufficient information' rather than guessing.",
      "Never hallucinate funding data, company statistics, revenue figures, valuations, or market sizes without clear support.",
      "Do not fabricate competitors, customer evidence, or product claims.",
      "Your analysis should be detailed, practical, and investor-oriented, not generic or shallow.",
      "Only generate the analysis sections requested by the user in analysisOptions.",
      "Do NOT generate or include any sections that are not listed in analysisOptions.",
      "Omit every unselected section completely; do not return null values, empty arrays, empty objects, or placeholder fields for unrequested sections.",
      "Return only summary plus the requested section fields.",
      "Do NOT fabricate missing sections or add default content for unrequested sections.",
      "Use exactly these requested section names when returning JSON: competitorAnalysis, marketResearch, riskAssessment, evidenceValidation, pitchImprovements.",
      "Each returned section must match the schema exactly and only appear when the user requested it.",
      "For evidence validation, do not simply repeat the user claim. Evaluate the claim critically and explain why it is supported or weak.",
      "For each evidenceValidation item, include claim, status, and reason.",
      "Status must be one of: Supported, Partially Supported, Weakly Supported, Insufficient Evidence.",
      "Reason should explain WHY the status was assigned using industry context, business reasoning, and startup best practices.",
      "Do not fabricate citations, URLs, research papers, government reports, funding numbers, market statistics, or company data.",
      "Return ONLY valid JSON with no markdown, no code fences, no explanations, and no extra text.",
      "Include the requested sections plus a concise summary.",
      "Use exactly this JSON shape and include only the requested section fields. Each angle-bracket value is a DESCRIPTION of what to write — replace every one with real, specific content grounded in the startup details above. Never output the literal placeholder text, the angle brackets, or the word \"string\".",
      '{"summary":"<2-3 sentence executive summary of the opportunity>","competitorAnalysis":[{"name":"<real competitor company name>","description":"<what they do and how they overlap with this startup>","strength":"<their main competitive strength>"}],"marketResearch":{"marketSize":"<market size estimate with brief reasoning>","targetAudience":"<who the buyers are>","industryTrend":"<a relevant current industry trend>"},"riskAssessment":["<a specific, concrete risk>"],"evidenceValidation":[{"claim":"<a claim taken from the pitch>","status":"Supported | Partially Supported | Weakly Supported | Insufficient Evidence","reason":"<why this status, with concrete reasoning>"}],"pitchImprovements":["<a concrete, actionable improvement>"]}',
      "Reminder: if any field would contain the word \"string\" or an angle-bracket placeholder, you have not done the task — write the real analysis instead.",
      "",
      `requestedSections: ${analysisOptions.join(", ")}`,
      `startupName: ${startupName}`,
      `idea: ${typeof body?.oneLineIdea === "string" ? body.oneLineIdea.trim() : ""}`,
      `problemStatement: ${problemStatement}`,
      `targetAudience: ${typeof body?.targetAudience === "string" ? body.targetAudience.trim() : ""}`,
      `industry: ${typeof body?.industry === "string" ? body.industry : ""}`,
      `revenueModel: ${typeof body?.revenueModel === "string" ? body.revenueModel : ""}`,
      `startupStage: ${typeof body?.startupStage === "string" ? body.startupStage : ""}`,
      `pitch: ${typeof body?.pitch === "string" ? body.pitch.trim() : ""}`,
      `analysisOptions: ${analysisOptions.join(", ")}`,
    ].join("\n");

    let content = "";
    try {
      const provider = getProvider();
      content = await provider.analyzeStartup(prompt);
      content = (content || "").trim();
    } catch (e: any) {
      return NextResponse.json(
        {
          success: false,
          message: e?.message || "AI analysis failed. Please check provider configuration.",
        },
        { status: 502 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to parse AI response: Empty response.",
        },
        { status: 500 }
      );
    }

    const normalizedContent = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const extractJson = (text: string): string | null => {
      const startIndex = text.indexOf("{");
      if (startIndex === -1) return null;
      // String-aware brace matching: ignore braces inside quoted strings so a
      // value like "we grew {fast}" can't throw off the depth count.
      let depth = 0;
      let inStr = false;
      let esc = false;
      for (let i = startIndex; i < text.length; i += 1) {
        const char = text[i];
        if (inStr) {
          if (esc) esc = false;
          else if (char === "\\") esc = true;
          else if (char === '"') inStr = false;
        } else if (char === '"') {
          inStr = true;
        } else if (char === "{") {
          depth += 1;
        } else if (char === "}") {
          depth -= 1;
          if (depth === 0) {
            return text.slice(startIndex, i + 1);
          }
        }
      }
      return null;
    };

    const normalizeEvidenceValidation = (value: unknown) => {
      if (!Array.isArray(value)) return value;
      return value.map((item) => {
        if (typeof item !== "object" || item === null) return item;
        const normalizedItem = { ...item } as Record<string, unknown>;

        if (normalizedItem.reason == null) {
          if (typeof normalizedItem.reasoning === "string") {
            normalizedItem.reason = normalizedItem.reasoning;
          } else if (typeof normalizedItem.explanation === "string") {
            normalizedItem.reason = normalizedItem.explanation;
          } else if (typeof normalizedItem.details === "string") {
            normalizedItem.reason = normalizedItem.details;
          }
        }

        return normalizedItem;
      });
    };

    try {
      let analysis: unknown;
      try {
        analysis = JSON.parse(normalizedContent);
      } catch {
        const jsonBlock = extractJson(normalizedContent);
        if (!jsonBlock) {
          throw new Error("No JSON block found");
        }
        analysis = JSON.parse(jsonBlock);
      }

      if (typeof analysis === "object" && analysis !== null && "evidenceValidation" in analysis) {
        const typedAnalysis = analysis as Record<string, unknown>;
        typedAnalysis.evidenceValidation = normalizeEvidenceValidation(typedAnalysis.evidenceValidation);
        analysis = typedAnalysis;
      }

      return NextResponse.json(
        {
          success: true,
          analysis,
        },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to parse AI response.",
        },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        errors: {
          request: "Unable to process request.",
        },
      },
      { status: 400 }
    );
  }
}
