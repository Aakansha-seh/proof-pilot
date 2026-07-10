import { NextRequest, NextResponse } from "next/server";
import { runProofPilotChat } from "@/chatbot/routes/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

// Thin Next.js adapter over the ported ProofPilot chatbot handler.
// The audit context is passed through from the page and injected into the
// mentor prompt by runProofPilotChat.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await runProofPilotChat({
      message: body?.message,
      context: body?.context,
      history: body?.history,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(
      { assistantResponse: result.assistantResponse },
      { status: result.status }
    );
  } catch (e) {
    const err = e as { statusCode?: number; expose?: boolean; message?: string };
    const status = err.statusCode || 500;
    const message =
      err.expose === false ? "Failed to process chat request." : err.message || "Failed to process chat request.";
    return NextResponse.json({ error: message }, { status });
  }
}
