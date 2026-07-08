"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, SlidersHorizontal, Swords, Wand2, ShieldCheck, Zap } from "lucide-react";
import type {
  Claim,
  ClaimAuditResponse,
  ClaimGroup,
  RiskLevel,
  ClaimCategory,
  EvidenceStatus,
  CompetitiveSignal,
} from "@/lib/schemas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CredibilityGauge } from "./credibility-gauge";
import { ClaimCard } from "./claim-card";
import { ClaimDetailPanel } from "./claim-detail-panel";
import {
  CATEGORY_LABEL,
  EVIDENCE_LABEL,
  GROUP_META,
  GROUP_ORDER,
} from "@/lib/claim-meta";
import { cn } from "@/lib/utils";
import { scoreBreakdown, auditHealth, highestRiskClaim } from "@/lib/claim-metrics";
import { ClaimMatrix } from "./claim-matrix";

type RiskFilter = "all" | RiskLevel;

const EMPTY_MSG: Record<string, string> = {
  proven: "Nothing proven yet — add evidence to move claims here.",
  needs_evidence: "No claims need evidence right now. Great — your audit is clear here.",
  risky_language: "No risky language detected. Your wording looks investor-safe here.",
  future_validation: "No forward-looking claims to validate in this bucket.",
};

export function ClaimMap({
  audit,
  auditId,
  onUseRewrite,
  onAddToPack,
  signals,
}: {
  audit: ClaimAuditResponse;
  auditId?: string;
  onUseRewrite?: (c: Claim) => void;
  onAddToPack?: (c: Claim) => void;
  signals?: Record<string, CompetitiveSignal>;
}) {
  const flaggedCount = signals
    ? audit.claims.filter(
        (c) => signals[c.id] && signals[c.id].verdict !== "plausible"
      ).length
    : 0;
  const [risk, setRisk] = useState<RiskFilter>("all");
  const [category, setCategory] = useState<ClaimCategory | "all">("all");
  const [evidence, setEvidence] = useState<EvidenceStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      audit.claims.filter(
        (c) =>
          (risk === "all" || c.risk_level === risk) &&
          (category === "all" || c.claim_category === category) &&
          (evidence === "all" || c.evidence_status === evidence)
      ),
    [audit.claims, risk, category, evidence]
  );

  const grouped = useMemo(() => {
    const map: Record<ClaimGroup, Claim[]> = {
      proven: [],
      needs_evidence: [],
      risky_language: [],
      future_validation: [],
    };
    for (const c of filtered) map[c.group].push(c);
    return map;
  }, [filtered]);

  const openClaim = audit.claims.find((c) => c.id === openId) || null;

  const breakdown = scoreBreakdown(audit);
  const health = auditHealth(audit);
  const topRisk = highestRiskClaim(audit);
  const resolved = health.proven;

  const categories = Array.from(
    new Set(audit.claims.map((c) => c.claim_category))
  );
  const evidenceStatuses = Array.from(
    new Set(audit.claims.map((c) => c.evidence_status))
  );

  return (
    <div>
      {/* Progress + action bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm">
          Audit progress:{" "}
          <span className="font-semibold">
            {resolved} of {health.total}
          </span>{" "}
          claims resolved
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-[hsl(var(--proven))] transition-all"
            style={{ width: `${health.total ? (resolved / health.total) * 100 : 0}%` }}
          />
        </div>
        {health.risky > 0 && topRisk && (
          <Button size="sm" className="ml-auto" onClick={() => setOpenId(topRisk.id)}>
            <ShieldCheck className="h-3.5 w-3.5" /> Resolve highest risk
          </Button>
        )}
      </div>

      {/* Summary row */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center gap-4 p-6">
          <CredibilityGauge score={audit.overall_credibility_score} />
          <div className="w-full space-y-2">
            {breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{b.label}</span>
                  <span className="tabular-nums">
                    {b.value}/{b.max}
                  </span>
                </div>
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(b.value / b.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full rounded-lg border border-border bg-secondary/30 p-2.5 text-center text-xs text-muted-foreground">
            <span className="font-medium text-[hsl(var(--proven))]">{health.supported} supported</span>
            {" · "}
            <span className="font-medium text-[hsl(var(--risk))]">{health.risky} risky</span>
            {" · "}
            <span className="font-medium text-[hsl(var(--warn))]">{health.needEvidence} need evidence</span>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Executive summary
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {audit.summary}
          </p>
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[hsl(var(--risk))]">
              <AlertTriangle className="h-3.5 w-3.5" /> Top risks
            </p>
            <div className="flex flex-wrap gap-1.5">
              {audit.top_risks.map((r, i) => (
                <Badge key={i} variant="risk">{r}</Badge>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary/8 p-4">
            <div className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Recommended next step
                </p>
                <p className="mt-0.5 text-sm text-foreground/90">{audit.recommended_next_step}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {topRisk && (
                <Button size="sm" onClick={() => setOpenId(topRisk.id)}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Fix highest-risk claim
                </Button>
              )}
              {topRisk && onUseRewrite && (
                <Button size="sm" variant="secondary" onClick={() => onUseRewrite(topRisk)}>
                  <Wand2 className="h-3.5 w-3.5" /> Generate safer rewrite
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Group counters */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {GROUP_ORDER.map((g) => (
          <div
            key={g}
            className="rounded-xl border border-border bg-card/60 p-4"
            style={{ borderColor: `hsl(var(${GROUP_META[g].token}) / 0.35)` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{GROUP_META[g].label}</span>
              <span
                className="text-xl font-semibold tabular-nums"
                style={{ color: `hsl(var(${GROUP_META[g].token}))` }}
              >
                {grouped[g].length}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Claim Confidence Matrix (signature visual) */}
      <Card className="mt-4 p-5">
        <ClaimMatrix claims={audit.claims} onOpen={(id) => setOpenId(id)} />
      </Card>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
        </span>
        <FilterGroup
          value={risk}
          onChange={(v) => setRisk(v as RiskFilter)}
          options={[
            { v: "all", l: "All risk" },
            { v: "high", l: "High" },
            { v: "medium", l: "Medium" },
            { v: "low", l: "Low" },
          ]}
        />
        <FilterGroup
          value={category}
          onChange={(v) => setCategory(v as ClaimCategory | "all")}
          options={[
            { v: "all", l: "All types" },
            ...categories.map((c) => ({ v: c, l: CATEGORY_LABEL[c] })),
          ]}
        />
        <FilterGroup
          value={evidence}
          onChange={(v) => setEvidence(v as EvidenceStatus | "all")}
          options={[
            { v: "all", l: "All evidence" },
            ...evidenceStatuses.map((e) => ({ v: e, l: EVIDENCE_LABEL[e] })),
          ]}
        />
      </div>

      {flaggedCount > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[hsl(var(--risk)/0.35)] bg-[hsl(var(--risk)/0.06)] p-3 text-sm">
          <Swords className="h-4 w-4 shrink-0 text-[hsl(var(--risk))]" />
          <span>
            {flaggedCount} claim{flaggedCount === 1 ? "" : "s"} flagged by your
            competitor analysis. Open a flagged claim to see the competitive risk and a safer rewrite.
          </span>
        </div>
      )}

      {/* Claim Map grouped grid */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {GROUP_ORDER.map((g) => (
          <div
            key={g}
            className="rounded-2xl border p-4"
            style={{
              borderColor: `hsl(var(${GROUP_META[g].token}) / 0.25)`,
              background: `hsl(var(${GROUP_META[g].token}) / 0.04)`,
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: `hsl(var(${GROUP_META[g].token}))` }}
              />
              <h3 className="text-sm font-semibold">{GROUP_META[g].label}</h3>
              <span className="text-xs text-muted-foreground">
                {grouped[g].length}
              </span>
            </div>
            <div className="space-y-3">
              {grouped[g].length === 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-card/40 p-4 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--proven))]" />
                  <span>{EMPTY_MSG[g] ?? "No claims in this category."}</span>
                </div>
              )}
              {grouped[g].map((c, i) => (
                <ClaimCard
                  key={c.id}
                  claim={c}
                  index={i}
                  onOpen={() => setOpenId(c.id)}
                  signal={signals?.[c.id]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {openClaim && (
          <ClaimDetailPanel
            claim={openClaim}
            auditId={auditId}
            onClose={() => setOpenId(null)}
            onUseRewrite={onUseRewrite}
            onAddToPack={onAddToPack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs transition-colors",
            value === o.v
              ? "border-primary/50 bg-primary/12 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
