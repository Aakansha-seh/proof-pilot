import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai/providers";
import { ProviderError } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const TONES = ["conservative", "balanced", "confident"] as const;

export async function POST(req: NextRequest) {
  try {
    const { text, tone } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing pitch text." }, { status: 400 });
    }
    const t = TONES.includes(tone) ? tone : "balanced";
    const rewritten = await getProvider().rewritePitch(text, t);
    return NextResponse.json({ rewritten });
  } catch (e) {
    const message =
      e instanceof ProviderError ? e.message : "Rewrite failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
