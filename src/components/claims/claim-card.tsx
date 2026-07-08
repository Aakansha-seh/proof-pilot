"use client";

import { motion } from "framer-motion";
import { ChevronRight, Swords } from "lucide-react";
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
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
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
