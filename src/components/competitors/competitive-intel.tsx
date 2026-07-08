"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  AlertTriangle,
  Plus,
  X,
  PlayCircle,
  Radar,
  Cpu,
  RefreshCw,
} from "lucide-react";
import type { SavedAudit, CompetitiveSignal } from "@/lib/schemas";
import type { CompetitiveIntelResponse } from "@/lib/competitors/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MomentumMap } from "./momentum-map";
import { DecisionStrip, StrategicInsights } from "./decision-strip";
import { ClaimStressTest } from "./claim-stress-test";
import { ComparisonTable } from "./comparison-table";
import { StrategyArea, SourcesTimeline } from "./strategy-area";
import { DEMO_INTEL } from "@/lib/competitors/demo";
import { buildInsight, QUADRANT_META, type Quadrant } from "@/lib/competitors/insight";
import { useAudits } from "@/lib/store";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Map" },
  { id: "claim", label: "Claim Stress Test" },
  { id: "comparison", label: "Comparison" },
  { id: "strategy", label: "Strategy" },
  { id: "sources", label: "Sources" },
];

export function CompetitiveIntel({
  audit,
  onGoToRewrite,
  onGoToClaims,
}: {
  audit: SavedAudit;
  onGoToRewrite?: () => void;
  onGoToClaims?: (claimId?: string) => void;
}) {
  const setIntel = useAudits((s) => s.setCompetitiveIntel);
  const appendRewrite = useAudits((s) => s.appendRewrite);
  const applyCompetitiveSignals = useAudits((s) => s.applyCompetitiveSignals);
  const intel = audit.competitiveIntel;

  const [chips, setChips] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const comparativeClaims = audit.audit.claims
    .filter((c) => ["comparative", "market", "guarantee"].includes(c.claim_category))
    .map((c) => ({ id: c.id, text: c.claim_text }));

  async function run() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: audit.originalText,
          knownCompetitors: chips,
          comparativeClaims,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      applyIntel(data.intel);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const applyIntel = (data: CompetitiveIntelResponse) => {
    setIntel(audit.id, data);
    applyCompetitiveSignals(audit.id, resolveSignals(data, audit.audit.claims));
  };

  function addChip() {
    const v = draft.trim();
    if (v && !chips.includes(v)) setChips([...chips, v]);
    setDraft("");
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const sendToRewrite = (text: string) => {
    appendRewrite(audit.id, text);
    onGoToRewrite?.();
  };

  if (!intel) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Competitive Intelligence</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Source-backed, time-aware competitor research. We review public pages
            from the last ~24 months and never present model memory as market fact.
          </p>

          <label className="mt-6 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Known competitors (optional)
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChip())}
              placeholder="e.g. Cleo, Copilot Money…"
            />
            <Button variant="secondary" onClick={addChip}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <Badge key={c} variant="neutral" className="gap-1">
                  {c}
                  <button onClick={() => setChips(chips.filter((x) => x !== c))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[hsl(var(--risk)/0.4)] bg-[hsl(var(--risk)/0.08)] p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--risk))]" /> {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={run} disabled={status === "loading"}>
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Research competitors
            </Button>
            <Button variant="secondary" onClick={() => applyIntel({ ...DEMO_INTEL })}>
              <PlayCircle className="h-4 w-4" /> Load demo
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Live research needs <code className="rounded bg-secondary px-1">SEARCH_PROVIDER</code>{" "}
            configured. Without it, competitors are labeled with limited-activity notices — or load the demo.
          </p>
        </Card>
      </div>
    );
  }

  const insight = buildInsight(intel.competitors);
  const order: Quadrant[] = ["direct_threat", "watch_closely", "adjacent", "low_priority"];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Cpu className={cn("h-3.5 w-3.5", intel.meta.usedAmd && "text-[hsl(0_72%_58%)]")} />
          {intel.meta.usedAmd ? "AMD Inference Mode" : `Analysis via ${intel.meta.providerUsed.toUpperCase()}`}
        </span>
        <span>· {intel.meta.competitorsAnalyzed} competitors</span>
        {intel.meta.analysisDurationMs > 0 && (
          <span>· {(intel.meta.analysisDurationMs / 1000).toFixed(2)}s</span>
        )}
        <span>· {intel.meta.sourcesReviewed} sources · search: {intel.meta.searchProvider}</span>
        <button
          onClick={() => setIntel(audit.id, undefined)}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/5 hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" /> Run again
        </button>
      </div>

      <StickyNav onJump={scrollTo} />

      <div className="space-y-10">
        <section id="overview" className="scroll-mt-28">
          <DecisionStrip
            intel={intel}
            onAddPositioning={sendToRewrite}
            onViewProof={() => scrollTo("strategy")}
          />
        </section>

        <section id="map" className="scroll-mt-28">
          <Card className="overflow-hidden p-0">
            <div className="relative border-b border-border p-5">
              <div className="pointer-events-none absolute inset-0 aurora opacity-40" />
              <div className="relative">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Positioning hypothesis
                </p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-gradient">
                  {insight.headline}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{insight.recommendation}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.map((q) => (
                    <div
                      key={q}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5"
                      title={QUADRANT_META[q].desc}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: `hsl(var(${QUADRANT_META[q].token}))` }} />
                      <span className="text-xs text-muted-foreground">{QUADRANT_META[q].label}</span>
                      <span className="text-sm font-semibold tabular-nums" style={{ color: `hsl(var(${QUADRANT_META[q].token}))` }}>
                        {insight.counts[q]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <MomentumMap competitors={intel.competitors} selected={selected} onSelect={setSelected} />
            </div>
          </Card>
        </section>

        <section id="claim" className="scroll-mt-28">
          <ClaimStressTest
            intel={intel}
            onUseRewrite={sendToRewrite}
            onViewEvidence={() => scrollTo("sources")}
            onOpenClaim={(cid) => onGoToClaims?.(cid)}
          />
        </section>

        <section id="insights" className="scroll-mt-28">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Strategic insights
          </h3>
          <StrategicInsights intel={intel} onViewSources={() => scrollTo("sources")} />
        </section>

        <section id="comparison" className="scroll-mt-28">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Competitor comparison
          </h3>
          <ComparisonTable competitors={intel.competitors} selected={selected} onSelect={setSelected} />
        </section>

        <section id="strategy" className="scroll-mt-28">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Strategy
          </h3>
          <StrategyArea intel={intel} auditId={audit.id} />
        </section>

        <section id="sources" className="scroll-mt-28">
          <SourcesTimeline intel={intel} />
        </section>
      </div>
    </div>
  );
}

function StickyNav({ onJump }: { onJump: (id: string) => void }) {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="sticky top-16 z-20 -mx-1 mb-6 hidden overflow-x-auto rounded-lg border border-border bg-background/80 px-1 py-1 backdrop-blur md:flex">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => onJump(s.id)}
          className={cn(
            "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            active === s.id
              ? "bg-primary/12 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}


// Map competitor stress-test results back onto Claim Map claims (by id, then text).
function resolveSignals(
  data: CompetitiveIntelResponse,
  claims: { id: string; claim_text: string }[]
): CompetitiveSignal[] {
  const byId = new Map(claims.map((c) => [c.id, c]));
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const out: CompetitiveSignal[] = [];
  for (const cc of data.claimCrossCheck) {
    let claimId = cc.claimId && byId.has(cc.claimId) ? cc.claimId : undefined;
    if (!claimId) {
      const key = norm(cc.claimText).slice(0, 30);
      const match = claims.find(
        (c) => key.length > 6 && (norm(c.claim_text).includes(key) || key.includes(norm(c.claim_text).slice(0, 30)))
      );
      claimId = match?.id;
    }
    if (claimId) {
      out.push({
        claimId,
        verdict: cc.verdict,
        reasoning: cc.reasoning,
        saferRewrite: cc.saferRewrite,
        competitorRef: cc.competitorRef,
        checkedAt: data.meta.generatedAt,
      });
    }
  }
  return out;
}
