"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, Wand2, Link2, FileSearch, ChevronDown } from "lucide-react";
import type {
  CompetitiveIntelResponse,
  ClaimCrossCheck,
} from "@/lib/competitors/schema";
import { verdictSeverity } from "@/lib/competitors/insight";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const VERDICT_META: Record<
  ClaimCrossCheck["verdict"],
  { label: string; variant: "risk" | "warn" | "proven" }
> = {
  unsupported: { label: "Unsupported", variant: "risk" },
  needs_benchmark: { label: "Needs benchmark", variant: "warn" },
  plausible: { label: "Plausible", variant: "proven" },
};

export function ClaimStressTest({
  intel,
  onUseRewrite,
  onViewEvidence,
  onOpenClaim,
}: {
  intel: CompetitiveIntelResponse;
  onUseRewrite: (text: string) => void;
  onViewEvidence: () => void;
  onOpenClaim: (claimId?: string) => void;
}) {
  const sorted = useMemo(
    () =>
      [...intel.claimCrossCheck].sort(
        (a, b) => verdictSeverity(b.verdict) - verdictSeverity(a.verdict)
      ),
    [intel.claimCrossCheck]
  );
  const [expanded, setExpanded] = useState(false);

  if (sorted.length === 0) {
    return (
      <Card className="p-5">
        <SectionTitle />
        <p className="mt-3 text-sm text-muted-foreground">
          No comparative or absolute claims from the audit required stress-testing
          against reviewed sources.
        </p>
      </Card>
    );
  }

  const [top, ...rest] = sorted;

  return (
    <Card className="p-5">
      <SectionTitle />
      <p className="mt-1 text-xs text-muted-foreground">
        Highest-risk claim from your audit, checked against reviewed competitor evidence.
      </p>

      <div className="mt-4">
        <StressRow
          cc={top}
          prominent
          onUseRewrite={onUseRewrite}
          onViewEvidence={onViewEvidence}
          onOpenClaim={onOpenClaim}
        />
      </div>

      {rest.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Hide" : `View all claim stress tests (${rest.length} more)`}
          </button>
          {expanded && (
            <div className="mt-3 space-y-3">
              {rest.map((cc, i) => (
                <StressRow
                  key={i}
                  cc={cc}
                  onUseRewrite={onUseRewrite}
                  onViewEvidence={onViewEvidence}
                  onOpenClaim={onOpenClaim}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function SectionTitle() {
  return (
    <div className="flex items-center gap-2">
      <ShieldAlert className="h-4 w-4 text-[hsl(var(--risk))]" />
      <h3 className="text-sm font-semibold">Claim stress test</h3>
    </div>
  );
}

function StressRow({
  cc,
  prominent = false,
  onUseRewrite,
  onViewEvidence,
  onOpenClaim,
}: {
  cc: ClaimCrossCheck;
  prominent?: boolean;
  onUseRewrite: (text: string) => void;
  onViewEvidence: () => void;
  onOpenClaim: (claimId?: string) => void;
}) {
  const v = VERDICT_META[cc.verdict];
  return (
    <div
      className={`rounded-xl border p-4 ${
        prominent
          ? "border-[hsl(var(--risk)/0.35)] bg-[hsl(var(--risk)/0.05)]"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your claim
          </p>
          <p className="mt-1 text-sm font-medium leading-relaxed">“{cc.claimText}”</p>
        </div>
        <Badge variant={v.variant} className="shrink-0">{v.label}</Badge>
      </div>

      {cc.competitorRef && (
        <p className="mt-2 text-xs text-muted-foreground">Checked against: {cc.competitorRef}</p>
      )}

      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Why</p>
        <p className="mt-1 text-sm text-foreground/90">{cc.reasoning}</p>
      </div>

      <div className="mt-3 rounded-lg border border-[hsl(var(--proven)/0.25)] bg-[hsl(var(--proven)/0.05)] p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--proven))]">
          Safer rewrite
        </p>
        <p className="mt-1 text-sm text-foreground/90">{cc.saferRewrite}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => onUseRewrite(cc.saferRewrite)}>
          <Wand2 className="h-3.5 w-3.5" /> Use rewrite
        </Button>
        <Button size="sm" variant="ghost" onClick={onViewEvidence}>
          <Link2 className="h-3.5 w-3.5" /> View linked evidence
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onOpenClaim(cc.claimId)}>
          <FileSearch className="h-3.5 w-3.5" /> Open original claim
        </Button>
      </div>
    </div>
  );
}
