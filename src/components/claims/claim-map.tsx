"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, SlidersHorizontal } from "lucide-react";
import type {
  Claim,
  ClaimAuditResponse,
  ClaimGroup,
  RiskLevel,
  ClaimCategory,
  EvidenceStatus,
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

type RiskFilter = "all" | RiskLevel;

export function ClaimMap({
  audit,
  auditId,
  onUseRewrite,
  onAddToPack,
}: {
  audit: ClaimAuditResponse;
  auditId?: string;
  onUseRewrite?: (c: Claim) => void;
  onAddToPack?: (c: Claim) => void;
}) {
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

  const categories = Array.from(
    new Set(audit.claims.map((c) => c.claim_category))
  );
  const evidenceStatuses = Array.from(
    new Set(audit.claims.map((c) => c.evidence_status))
  );

  return (
    <div>
      {/* Summary row */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="flex items-center justify-center p-6">
          <CredibilityGauge score={audit.overall_credibility_score} />
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
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <span className="font-medium">Recommended next step: </span>
              {audit.recommended_next_step}
            </span>
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

      {/* Claim Map grouped grid */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {GROUP_ORDER.map((g) => (
          <div key={g}>
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
                <p className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                  No claims here.
                </p>
              )}
              {grouped[g].map((c, i) => (
                <ClaimCard
                  key={c.id}
                  claim={c}
                  index={i}
                  onOpen={() => setOpenId(c.id)}
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
