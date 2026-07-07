import { NextRequest, NextResponse } from "next/server";
import { getProvider, activeProviderId } from "@/lib/ai/providers";
import { ProviderError } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds the 8 MB limit." },
        { status: 400 }
      );
    }
    const type = file.type || "image/png";
    if (!ALLOWED.includes(type)) {
      return NextResponse.json(
        { error: "Supported formats: PNG, JPG, JPEG, WEBP." },
        { status: 400 }
      );
    }

    // Convert to base64 in-memory. The original image is never persisted.
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const analysis = await getProvider().analyzeImage(base64, type);

    return NextResponse.json({
      provider: activeProviderId(),
      fileName: file.name,
      mimeType: type,
      analysis,
    });
  } catch (e) {
    const message =
      e instanceof ProviderError
        ? e.message
        : "Image analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
