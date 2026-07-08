"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ImagePlus,
  Link2,
  StickyNote,
  Hash,
  Check,
  Wand2,
  FilePlus2,
  Loader2,
  AlertTriangle,
  Swords,
} from "lucide-react";
import type { Claim, EvidenceItem } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_LABEL,
  EVIDENCE_LABEL,
  GROUP_META,
  RISK_BADGE,
} from "@/lib/claim-meta";
import { useAudits } from "@/lib/store";
import { uid } from "@/lib/utils";

type AttachMode = null | "image" | "link" | "note" | "metric";

export function ClaimDetailPanel({
  claim,
  auditId,
  onClose,
  onUseRewrite,
  onAddToPack,
}: {
  claim: Claim;
  auditId?: string;
  onClose: () => void;
  onUseRewrite?: (claim: Claim) => void;
  onAddToPack?: (claim: Claim) => void;
}) {
  const g = GROUP_META[claim.group];
  const audit = useAudits((s) => (auditId ? s.getAudit(auditId) : undefined));
  const addEvidence = useAudits((s) => s.addEvidence);
  const updateClaimGroup = useAudits((s) => s.updateClaimGroup);
  const appendRewrite = useAudits((s) => s.appendRewrite);
  const signal = audit?.competitiveSignals?.[claim.id];
  const items =
    audit?.evidenceItems.filter((it) => it.claimId === claim.id) ?? [];

  const [mode, setMode] = useState<AttachMode>(null);

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: `hsl(var(${g.token}))` }}
          />
          <Badge variant={g.badge}>{g.label}</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 scroll-thin">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original claim
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">{claim.claim_text}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={RISK_BADGE[claim.risk_level]}>{claim.risk_level} risk</Badge>
          <Badge variant="neutral">{CATEGORY_LABEL[claim.claim_category]}</Badge>
          <Badge variant="outline">{EVIDENCE_LABEL[claim.evidence_status]}</Badge>
          <Badge variant="outline">
            {Math.round(claim.confidence_score * 100)}% confidence
          </Badge>
        </div>

        <Field label="Why it matters">{claim.why_it_matters}</Field>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Evidence needed
          </p>
          <ul className="mt-2 space-y-1.5">
            {claim.evidence_needed.map((e, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground/90">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Validation plan
          </p>
          <dl className="mt-2 space-y-1.5 text-sm">
            <PlanRow k="Goal" v={claim.validation_plan.goal} />
            <PlanRow k="Method" v={claim.validation_plan.method} />
            <PlanRow k="Metric" v={claim.validation_plan.metric} />
            <PlanRow k="Success" v={claim.validation_plan.success_criteria} />
          </dl>
        </div>

        <div className="rounded-xl border border-[hsl(var(--proven)/0.3)] bg-[hsl(var(--proven)/0.06)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--proven))]">
            Credible rewrite
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">{claim.credible_rewrite}</p>
        </div>

        {signal && signal.verdict !== "plausible" && (
          <div className="rounded-xl border border-[hsl(var(--risk)/0.35)] bg-[hsl(var(--risk)/0.06)] p-4">
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-[hsl(var(--risk))]" />
              <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--risk))]">
                Competitive risk
              </p>
              <Badge variant={signal.verdict === "unsupported" ? "risk" : "warn"}>
                {signal.verdict.replace("_", " ")}
              </Badge>
            </div>
            {signal.competitorRef && (
              <p className="mt-2 text-xs text-muted-foreground">
                Checked against: {signal.competitorRef}
              </p>
            )}
            <p className="mt-1.5 text-sm text-foreground/90">{signal.reasoning}</p>
            <div className="mt-2 rounded-lg bg-[hsl(var(--proven)/0.08)] p-2 text-sm">
              <span className="text-[hsl(var(--proven))]">Safer: </span>
              {signal.saferRewrite}
            </div>
            {auditId && (
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  appendRewrite(auditId, signal.saferRewrite);
                  onUseRewrite?.(claim);
                }}
              >
                <Wand2 className="h-3.5 w-3.5" /> Use safer rewrite
              </Button>
            )}
          </div>
        )}

        {/* Attached evidence */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Attached evidence
          </p>
          {items.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing attached yet.
            </p>
          )}
          <div className="mt-2 space-y-2">
            {items.map((it) => (
              <EvidenceRow key={it.id} item={it} />
            ))}
          </div>

          {auditId && (
            <div className="mt-3">
              <div className="grid grid-cols-4 gap-1.5">
                <AttachBtn icon={ImagePlus} label="Image" onClick={() => setMode("image")} />
                <AttachBtn icon={Link2} label="Link" onClick={() => setMode("link")} />
                <AttachBtn icon={StickyNote} label="Note" onClick={() => setMode("note")} />
                <AttachBtn icon={Hash} label="Metric" onClick={() => setMode("metric")} />
              </div>
              <AnimatePresence>
                {mode && (
                  <AttachForm
                    mode={mode}
                    onCancel={() => setMode(null)}
                    onSubmit={(item) => {
                      addEvidence(auditId, item);
                      setMode(null);
                    }}
                    claimId={claim.id}
                  />
                )}
              </AnimatePresence>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Evidence is never auto-marked &ldquo;verified.&rdquo; You control its status.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border p-4">
        <Button
          variant="secondary"
          size="sm"
          className="flex-col gap-1 py-2 text-[11px] h-auto"
          onClick={() =>
            auditId && updateClaimGroup(auditId, claim.id, "proven")
          }
          disabled={!auditId}
        >
          <Check className="h-4 w-4" /> Evidence Added
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-col gap-1 py-2 text-[11px] h-auto"
          onClick={() => onUseRewrite?.(claim)}
        >
          <Wand2 className="h-4 w-4" /> Use Rewrite
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-col gap-1 py-2 text-[11px] h-auto"
          onClick={() => onAddToPack?.(claim)}
        >
          <FilePlus2 className="h-4 w-4" /> Add to Pack
        </Button>
      </div>
    </motion.aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

function PlanRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 text-muted-foreground">{k}</dt>
      <dd className="flex-1">{v}</dd>
    </div>
  );
}

function AttachBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ImagePlus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary/40 py-2 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

const STATUS_BADGE: Record<EvidenceItem["status"], "proven" | "warn" | "future" | "neutral"> = {
  attached: "neutral",
  needs_review: "warn",
  user_reported: "future",
  validation_pending: "warn",
};

function EvidenceRow({ item }: { item: EvidenceItem }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{item.type}</span>
        <Badge variant={STATUS_BADGE[item.status]} className="text-[10px]">
          {item.status.replace(/_/g, " ")}
        </Badge>
      </div>
      {item.fileName && (
        <p className="mt-1 text-xs text-muted-foreground">{item.fileName}</p>
      )}
      {item.url && (
        <p className="mt-1 truncate text-xs text-primary">{item.url}</p>
      )}
      {item.note && <p className="mt-1 text-xs text-foreground/80">{item.note}</p>}
      {item.evidenceSummary && (
        <p className="mt-1 text-xs text-muted-foreground">{item.evidenceSummary}</p>
      )}
      {item.extractedText && (
        <p className="mt-1 rounded bg-background/60 p-2 text-[11px] text-muted-foreground">
          “{item.extractedText}”
        </p>
      )}
      {item.type === "image" && (
        <p className="mt-1 text-[11px] italic text-muted-foreground">
          Original image not retained. Analysis saved on this device.
        </p>
      )}
    </div>
  );
}

function AttachForm({
  mode,
  claimId,
  onSubmit,
  onCancel,
}: {
  mode: Exclude<AttachMode, null>;
  claimId: string;
  onSubmit: (item: EvidenceItem) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = (): Omit<EvidenceItem, "type" | "status"> => ({
    id: uid("ev"),
    claimId,
    uploadedAt: new Date().toISOString(),
  });

  async function handleImage(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/analyze-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image analysis failed.");
      onSubmit({
        ...base(),
        type: "image",
        status: "needs_review",
        fileName: data.fileName,
        mimeType: data.mimeType,
        extractedText: data.analysis?.extracted_text,
        evidenceSummary: data.analysis?.evidence_summary,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-2 rounded-lg border border-border bg-background/50 p-3"
    >
      {mode === "image" && (
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:text-foreground"
            onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
            disabled={busy}
          />
          {busy && (
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing image…
            </p>
          )}
        </div>
      )}

      {mode === "link" && (
        <Input
          placeholder="https://evidence-source.com"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      {mode === "note" && (
        <Textarea
          placeholder="Add a note about this evidence…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[70px]"
        />
      )}

      {mode === "metric" && (
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Label" value={text} onChange={(e) => setText(e.target.value)} />
          <Input placeholder="Value" value={text2} onChange={(e) => setText2(e.target.value)} />
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-[hsl(var(--risk))]">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {mode !== "image" && (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (mode === "link" && text) {
                onSubmit({ ...base(), type: "link", status: "user_reported", url: text });
              } else if (mode === "note" && text) {
                onSubmit({ ...base(), type: "note", status: "attached", note: text });
              } else if (mode === "metric" && text) {
                onSubmit({
                  ...base(),
                  type: "metric",
                  status: "validation_pending",
                  note: `${text}: ${text2}`,
                });
              }
            }}
          >
            Attach
          </Button>
        </div>
      )}
    </motion.div>
  );
}
