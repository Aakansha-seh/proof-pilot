"use client";

import { useState } from "react";
import {
  Compass,
  Crosshair,
  Lightbulb,
  Target,
  ArrowRight,
  Check,
  ChevronDown,
  Signal,
  Layers,
  DoorOpen,
  BookOpen,
} from "lucide-react";
import type { CompetitiveIntelResponse } from "@/lib/competitors/schema";
import {
  buildDecision,
  buildStrategicInsights,
  coverageOf,
  COVERAGE_LABEL,
} from "@/lib/competitors/insight";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// ---- 1. Competitive Outlook decision strip --------------------------------
export function DecisionStrip({
  intel,
  onAddPositioning,
  onViewProof,
}: {
  intel: CompetitiveIntelResponse;
  onAddPositioning: (statement: string) => void;
  onViewProof: () => void;
}) {
  const d = buildDecision(intel);
  const [added, setAdded] = useState(false);

  const blocks = [
    { icon: Compass, label: "Competitive outlook", value: d.outlook, tone: "--primary" },
    { icon: Crosshair, label: "Primary threat", value: d.primaryThreat, tone: "--risk" },
    { icon: Lightbulb, label: "Best wedge", value: d.bestWedge, tone: "--proven" },
    { icon: Target, label: "Next proof", value: d.nextProof, tone: "--future" },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {blocks.map((b) => (
          <div key={b.label} className="bg-card p-4">
            <div className="flex items-center gap-2">
              <b.icon className="h-4 w-4" style={{ color: `hsl(var(${b.tone}))` }} />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {b.label}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{b.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-secondary/20 p-3">
        <Button
          size="sm"
          onClick={() => {
            onAddPositioning(d.positioningStatement);
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
        >
          {added ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          {added ? "Added to rewrite" : "Add positioning to rewrite"}
        </Button>
        <Button size="sm" variant="secondary" onClick={onViewProof}>
          View proof plan
        </Button>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Positioning hypothesis · needs validation
        </span>
      </div>
    </Card>
  );
}

// ---- 4. Strategic Insights (replaces the long market narrative) -----------
const INSIGHT_ICON = {
  market_signal: Signal,
  competitive_pattern: Layers,
  strategic_opening: DoorOpen,
} as const;

export function StrategicInsights({
  intel,
  onViewSources,
}: {
  intel: CompetitiveIntelResponse;
  onViewSources: () => void;
}) {
  const insights = buildStrategicInsights(intel);
  const coverage = coverageOf(intel);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        {insights.map((ins) => {
          const Icon = INSIGHT_ICON[ins.key];
          return (
            <Card key={ins.key} className="flex flex-col p-4">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/12 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">{ins.title}</p>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/85">
                {ins.text}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <Badge
                  variant={coverage === "high" ? "proven" : coverage === "medium" ? "warn" : "neutral"}
                  className="text-[10px]"
                >
                  {COVERAGE_LABEL[coverage]}
                </Badge>
                <button
                  onClick={onViewSources}
                  className="text-[11px] text-primary hover:underline"
                >
                  View sources
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Read full analysis
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="mt-2 rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground/85">
            {intel.summary}
          </div>
        )}
      </div>
    </div>
  );
}
