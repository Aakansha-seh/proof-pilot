"use client";

import { useState } from "react";
import { Copy, Check, Wand2, Loader2, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Tone = "conservative" | "balanced" | "confident";

const TONES: { id: Tone; label: string }[] = [
  { id: "conservative", label: "Conservative" },
  { id: "balanced", label: "Balanced" },
  { id: "confident", label: "Confident but defensible" },
];

export function PitchRewrite({
  original,
  initialRewrite,
  onSave,
}: {
  original: string;
  initialRewrite?: string;
  onSave?: (text: string) => void;
}) {
  const [tone, setTone] = useState<Tone>("balanced");
  const [rewrite, setRewrite] = useState(initialRewrite ?? "");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: original, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rewrite failed.");
      setRewrite(data.rewritten);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                tone === t.id
                  ? "border-primary/50 bg-primary/12 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={generate} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Generate Rewrite
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[hsl(var(--risk)/0.4)] bg-[hsl(var(--risk)/0.08)] p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-[hsl(var(--risk))]" /> {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original Pitch
          </p>
          <Textarea readOnly value={original} className="min-h-[320px] bg-secondary/20" />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[hsl(var(--proven))]">
            Evidence-Aware Rewrite
          </p>
          <Textarea
            value={rewrite}
            onChange={(e) => setRewrite(e.target.value)}
            placeholder="Your evidence-aware rewrite will appear here…"
            className="min-h-[320px] border-[hsl(var(--proven)/0.3)]"
          />
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={!rewrite}
              onClick={() => {
                navigator.clipboard.writeText(rewrite);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy Rewrite
            </Button>
            {onSave && (
              <Button
                variant="secondary"
                size="sm"
                disabled={!rewrite}
                onClick={() => {
                  onSave(rewrite);
                  setSaved(true);
                  setTimeout(() => setSaved(false), 1500);
                }}
              >
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                Save to Audit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
