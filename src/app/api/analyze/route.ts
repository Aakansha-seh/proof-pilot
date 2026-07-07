import { NextRequest, NextResponse } from "next/server";
import { getProvider, activeProviderId } from "@/lib/ai/providers";
import { chunkText, cleanExtractedText } from "@/lib/text-clean";
import { mergeAudits } from "@/lib/merge-audit";
import { ProviderError } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide at least a couple of sentences to audit." },
        { status: 400 }
      );
    }

    const cleaned = cleanExtractedText(text);
    const provider = getProvider();
    const chunks = chunkText(cleaned);

    const parts = [];
    for (const chunk of chunks) {
      parts.push(await provider.analyzeClaims(chunk));
    }
    const audit = mergeAudits(parts);

    return NextResponse.json({ provider: activeProviderId(), audit });
  } catch (e) {
    const message =
      e instanceof ProviderError
        ? e.message
        : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
