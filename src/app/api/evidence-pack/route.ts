import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai/providers";
import { ClaimAuditResponseSchema } from "@/lib/schemas";
import { ProviderError } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ClaimAuditResponseSchema.safeParse(body?.audit);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "A valid audit is required to generate an Evidence Pack." },
        { status: 400 }
      );
    }
    const pack = await getProvider().generateEvidencePack(parsed.data);
    return NextResponse.json({ pack });
  } catch (e) {
    const message =
      e instanceof ProviderError
        ? e.message
        : "Evidence Pack generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
