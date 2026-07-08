"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Loader2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Check,
  PenLine,
} from "lucide-react";
import type { SavedAudit, ClaimAuditResponse, ClaimGroup } from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CredibilityGauge } from "./credibility-gauge";
import { GROUP_META } from "@/lib/claim-meta";

function countGroups(a: ClaimAuditResponse): Record<ClaimGroup, number> {
  const m: Record<ClaimGroup, number> = {
    proven: 0,
    needs_evidence: 0,
    risky_language: 0,
    future_validation: 0,
  };
  for (const c of a.claims) m[c.group]++;
  return m;
}

// ---- Trigger + score timeline (lives on the Rewrite tab) ------------------
export function ReauditPanel({
  audit,
  onReaudited,
}: {
  audit: SavedAudit;
  onReaudited: (newAudit: ClaimAuditResponse) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewrite = audit.rewrittenPitch?.trim() ?? "";
  const currentScore = audit.audit.overall_credibility_score;

  const history =
    audit.revisions && audit.revisions.length
      ? audit.revisions
      : [
          {
            label: "Original",
            text: audit.originalText,
            score: currentScore,
            createdAt: audit.createdAt,
          },
        ];

  async function reaudit() {
    if (!rewrite) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rewrite }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Re-audit failed.");
      onReaudited(data.audit as ClaimAuditResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Re-audit &amp; improve</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Score your rewrite against the current version — you'll see a
            side-by-side comparison on the Claim Map.
          </p>
        </div>
        <Button onClick={reaudit} disabled={loading || !rewrite}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Re-audit rewrite
        </Button>
      </div>

      {!rewrite && (
        <p className="mt-3 text-sm text-muted-foreground">
          Generate a rewrite above first — then re-audit it here.
        </p>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[hsl(var(--risk)/0.4)] bg-[hsl(var(--risk)/0.08)] p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-[hsl(var(--risk))]" /> {error}
        </div>
      )}

      {/* Score timeline */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {history.map((r, i) => {
          const d = i === 0 ? 0 : r.score - history[i - 1].score;
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
              <div className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {r.label}
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {r.score}
                  {i > 0 && (
                    <span
                      className="ml-1 text-[11px]"
                      style={{ color: `hsl(var(${d >= 0 ? "--proven" : "--risk"}))` }}
                    >
                      {d >= 0 ? "+" : ""}
                      {d}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---- Side-by-side comparison (lives on the Claim Map tab) -----------------
export function ReauditCompare({
  current,
  pending,
  onApply,
  onRewrite,
}: {
  current: ClaimAuditResponse;
  pending: ClaimAuditResponse;
  onApply: () => void;
  onRewrite: () => void;
}) {
  const before = countGroups(current);
  const after = countGroups(pending);
  const delta = pending.overall_credibility_score - current.overall_credibility_score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-primary/30 bg-card p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Re-audit comparison</h3>
        <Badge variant="neutral" className="ml-auto">
          {delta >= 0 ? "More credible" : "Less credible — keep refining"}
        </Badge>
      </div>

      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Previous audit
          </span>
          <CredibilityGauge score={current.overall_credibility_score} size={140} />
        </div>
        <div className="flex flex-col items-center gap-1">
          {delta >= 0 ? (
            <TrendingUp className="h-7 w-7 text-[hsl(var(--proven))]" />
          ) : (
            <TrendingDown className="h-7 w-7 text-[hsl(var(--risk))]" />
          )}
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: `hsl(var(${delta >= 0 ? "--proven" : "--risk"}))` }}
          >
            {delta >= 0 ? "+" : ""}
            {delta}
          </span>
          <span className="text-[11px] text-muted-foreground">points</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            New audit
          </span>
          <CredibilityGauge score={pending.overall_credibility_score} size={140} />
        </div>
      </div>

      {/* Group deltas */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(before) as ClaimGroup[]).map((g) => {
          const d = after[g] - before[g];
          const good = g === "proven" ? d >= 0 : d <= 0;
          return (
            <div key={g} className="rounded-lg border border-border bg-card/60 p-2.5 text-center">
              <div className="text-[10px] text-muted-foreground">{GROUP_META[g].label}</div>
              <div className="mt-0.5 text-sm font-semibold tabular-nums">
                {before[g]} → {after[g]}
                {d !== 0 && (
                  <span
                    className="ml-1 text-[11px]"
                    style={{ color: `hsl(var(${good ? "--proven" : "--risk"}))` }}
                  >
                    ({d > 0 ? "+" : ""}
                    {d})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-foreground/90">{pending.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onApply}>
          <Check className="h-4 w-4" /> Apply this audit
        </Button>
        <Button variant="secondary" onClick={onRewrite}>
          <PenLine className="h-4 w-4" /> Rewrite again
        </Button>
      </div>
    </motion.div>
  );
}
