import { NextRequest, NextResponse } from "next/server";
import { getProvider, activeProviderId } from "@/lib/ai/providers";
import { cleanExtractedText, chunkText } from "@/lib/text-clean";
import { mergeAudits } from "@/lib/merge-audit";
import { extractPdfText } from "@/lib/pdf-extract";
import { ProviderError } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const SCANNED_MESSAGE =
  "This document appears to be image-based or scanned. ProofPilot currently works best with selectable text PDFs. OCR support is coming soon.";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 10 MB limit." },
        { status: 400 }
      );
    }

    const name = file.name || "document";
    const isPdf =
      file.type === "application/pdf" || name.toLowerCase().endsWith(".pdf");
    const isTxt =
      file.type.startsWith("text/") || name.toLowerCase().endsWith(".txt");

    if (!isPdf && !isTxt) {
      return NextResponse.json(
        { error: "Only PDF and TXT files are supported." },
        { status: 400 }
      );
    }

    let rawText = "";
    let pageCount = 1;

    if (isPdf) {
      const buf = new Uint8Array(await file.arrayBuffer());
      const result = await extractPdfText(buf);
      pageCount = result.pageCount;
      if (result.imageOnly) {
        return NextResponse.json(
          { processing_status: "image_only", message: SCANNED_MESSAGE },
          { status: 200 }
        );
      }
      rawText = result.text;
    } else {
      rawText = await file.text();
    }

    const cleaned = cleanExtractedText(rawText);
    if (cleaned.length < 20) {
      return NextResponse.json(
        { processing_status: "image_only", message: SCANNED_MESSAGE },
        { status: 200 }
      );
    }

    const provider = getProvider();
    const chunks = chunkText(cleaned);
    const parts = [];
    for (const chunk of chunks) parts.push(await provider.analyzeClaims(chunk));
    const audit = mergeAudits(parts);

    return NextResponse.json({
      document_name: name,
      extracted_text: cleaned,
      extracted_text_preview: cleaned.slice(0, 240),
      page_count: pageCount,
      processing_status: "complete",
      provider: activeProviderId(),
      audit,
    });
  } catch (e) {
    const message =
      e instanceof ProviderError
        ? e.message
        : "Could not process the document. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
