import { NextResponse } from "next/server";
import { activeProviderId } from "@/lib/ai/providers";

export const runtime = "nodejs";

// Exposes only non-secret runtime config (never API keys).
export async function GET() {
  const id = activeProviderId();
  const upper = id.toUpperCase();
  return NextResponse.json({
    provider: id,
    model: process.env[`${upper}_MODEL`] || "(provider default)",
    configured: Boolean(process.env[`${upper}_API_KEY`]),
  });
}
