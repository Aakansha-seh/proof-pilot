"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Play,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/app/disclaimer";
import { AnalysisLoader } from "@/components/claims/analysis-loader";
import { INPUT_TEMPLATES } from "@/lib/templates";
import { DEMO_PITCH } from "@/lib/demo-data";
import { useAudits } from "@/lib/store";
import type { SavedAudit } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done" | "error";

export default function NewAuditPage() {
  const router = useRouter();
  const createAudit = useAudits((s) => s.createAudit);
  const addEvidence = useAudits((s) => s.addEvidence);

  const [text, setText] = useState(DEMO_PITCH);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const finish = (id: string) => router.push(`/app/audits/${id}`);

  async function runTextAudit() {
    if (text.trim().length < 20) {
      setError("Add at least a couple of sentences to audit.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setStatus("done");
      const id = createAudit({
        title: deriveTitle(text),
        sourceType: "pasted_text",
        originalText: text,
        providerUsed: data.provider,
        audit: data.audit,
      });
      setTimeout(() => finish(id), 500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const handleFile = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase();
      const isImage = /\.(png|jpe?g|webp)$/.test(name);
      const isDoc = /\.(pdf|txt)$/.test(name);
      if (!isImage && !isDoc) {
        setError("Supported: PDF, TXT, PNG, JPG, JPEG, WEBP.");
        setStatus("error");
        return;
      }
      setStatus("loading");
      setError(null);
      try {
        if (isDoc) {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/documents/analyze", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Could not process document.");
          if (data.processing_status === "image_only") {
            setError(data.message);
            setStatus("error");
            return;
          }
          setStatus("done");
          const id = createAudit({
            title: file.name,
            sourceType: name.endsWith(".pdf") ? "pdf" : "txt",
            documentName: file.name,
            originalText: data.extracted_text,
            providerUsed: data.provider,
            audit: data.audit,
          });
          setTimeout(() => finish(id), 500);
        } else {
          // Image source: extract visible claims, then build a light audit.
          const fd = new FormData();
          fd.append("image", file);
          const res = await fetch("/api/analyze-image", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Image analysis failed.");
          const visibleText: string =
            data.analysis?.extracted_text ||
            (data.analysis?.visible_claims || []).join(". ");
          if (!visibleText || visibleText.length < 15) {
            setError(
              "No readable claims were found in this image. Try a clearer slide or paste the text."
            );
            setStatus("error");
            return;
          }
          // Run the claim engine on the extracted text.
          const auditRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: visibleText }),
          });
          const auditData = await auditRes.json();
          if (!auditRes.ok) throw new Error(auditData.error || "Analysis failed.");
          setStatus("done");
          const id = createAudit({
            title: file.name,
            sourceType: "image",
            documentName: file.name,
            originalText: visibleText,
            providerUsed: auditData.provider,
            audit: auditData.audit,
          });
          // Persist the image analysis as evidence (no image stored).
          addEvidence(id, {
            id: `ev_${Date.now().toString(36)}`,
            type: "image",
            status: "needs_review",
            fileName: file.name,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            extractedText: data.analysis?.extracted_text,
            evidenceSummary: data.analysis?.evidence_summary,
          });
          setTimeout(() => finish(id), 500);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setStatus("error");
      }
    },
    [addEvidence, createAudit] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (status === "loading" || status === "done") {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <AnalysisLoader done={status === "done"} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Audit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste text, upload a document, or drop in a slide. ProofPilot finds the
          claims worth defending.
        </p>
      </div>

      {/* Templates */}
      <div className="mb-4 flex flex-wrap gap-2">
        {INPUT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setText(t.seed)}
            title={t.hint}
            className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setText(DEMO_PITCH)}
          className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary"
        >
          <Sparkles className="mr-1 inline h-3 w-3" /> Demo pitch
        </button>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your pitch, report, or proposal here…"
        className="min-h-[220px] text-[15px] leading-relaxed"
      />

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Drag & drop a file, or click to browse</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> PDF · TXT</span>
          <span className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> PNG · JPG · WEBP</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-[hsl(var(--risk)/0.4)] bg-[hsl(var(--risk)/0.08)] p-3 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--risk))]" />
          <div>
            <p>{error}</p>
            <Badge variant="outline" className="mt-2 cursor-pointer" onClick={() => setStatus("idle")}>
              Dismiss
            </Badge>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <Disclaimer className="flex-1" />
        <Button size="lg" onClick={runTextAudit} className="shrink-0">
          <Play className="h-4 w-4" /> Run Evidence Audit
        </Button>
      </div>
    </div>
  );
}

function deriveTitle(text: string): string {
  const firstLine = text.trim().split("\n")[0].replace(/[#*_>]/g, "").trim();
  const words = firstLine.split(/\s+/).slice(0, 6).join(" ");
  return words.length > 3 ? words : "Untitled audit";
}
