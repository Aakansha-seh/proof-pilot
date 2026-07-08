"use client";

import { motion } from "framer-motion";
import { ChevronRight, Swords } from "lucide-react";
import { claimRiskPercent } from "@/lib/claim-metrics";
import type { Claim, CompetitiveSignal } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORY_LABEL,
  EVIDENCE_LABEL,
  GROUP_META,
  RISK_BADGE,
} from "@/lib/claim-meta";

export function ClaimCard({
  claim,
  onOpen,
  index = 0,
  signal,
}: {
  claim: Claim;
  onOpen: () => void;
  index?: number;
  signal?: CompetitiveSignal;
}) {
  const g = GROUP_META[claim.group];
  const riskPct = claimRiskPercent(claim);
  const riskTone = riskPct >= 70 ? "--risk" : riskPct >= 40 ? "--warn" : "--proven";
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      onClick={onOpen}
      className="group w-full rounded-xl border border-border bg-card/60 p-4 text-left transition-colors hover:border-primary/40 hover:bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: `hsl(var(${g.token}))` }}
        />
        <p className="flex-1 text-sm leading-relaxed text-foreground/90 line-clamp-3">
          {claim.claim_text}
        </p>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-xs font-semibold tabular-nums" style={{ color: `hsl(var(${riskTone}))` }}>
            {riskPct}%
          </span>
          <span className="text-[10px] text-muted-foreground">risk</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-5">
        <Badge variant={RISK_BADGE[claim.risk_level]}>{claim.risk_level} risk</Badge>
        <Badge variant="neutral">{CATEGORY_LABEL[claim.claim_category]}</Badge>
        <Badge variant="outline">{EVIDENCE_LABEL[claim.evidence_status]}</Badge>
        {signal && signal.verdict !== "plausible" && (
          <Badge variant={signal.verdict === "unsupported" ? "risk" : "warn"} className="gap-1">
            <Swords className="h-3 w-3" /> competitor risk
          </Badge>
        )}
      </div>
    </motion.button>
  );
}
