"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ShieldQuestion } from "lucide-react";
import type { Competitor } from "@/lib/competitors/schema";
import { QUADRANT_META, quadrantOf, needsVerify } from "@/lib/competitors/insight";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

const NF = "Not found in reviewed sources.";

export function ComparisonTable({
  competitors,
  selected,
  onSelect,
}: {
  competitors: Competitor[];
  selected?: string | null;
  onSelect?: (name: string | null) => void;
}) {
  const [openName, setOpenName] = useState<string | null>(null);
  const open = competitors.find((c) => c.name === openName) || null;

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Competitor</th>
                <th className="px-4 py-2.5">Positioning</th>
                <th className="px-4 py-2.5">Overlap</th>
                <th className="px-4 py-2.5">Activity</th>
                <th className="px-4 py-2.5">Key gap</th>
                <th className="px-4 py-2.5">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => {
                const q = quadrantOf(c.productOverlap, c.marketActivitySignal);
                return (
                  <tr
                    key={c.name}
                    onClick={() => setOpenName(c.name)}
                    onMouseEnter={() => onSelect?.(c.name)}
                    onMouseLeave={() => onSelect?.(null)}
                    className={cn(
                      "cursor-pointer border-t border-border transition-colors hover:bg-white/[0.03]",
                      selected === c.name && "bg-primary/8"
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        {c.name}
                        {needsVerify(c) && (
                          <span title="AI-suggested or thinly sourced — verify">
                            <ShieldQuestion className="h-3.5 w-3.5 text-[hsl(var(--warn))]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {c.sources.length} source{c.sources.length === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-4 py-2.5 text-foreground/80">
                      <span className="line-clamp-1">{c.positioning || NF}</span>
                    </td>
                    <td className="px-4 py-2.5"><ScoreBar value={c.productOverlap} tone="--primary" /></td>
                    <td className="px-4 py-2.5">
                      <ScoreBar value={c.marketActivitySignal} tone={QUADRANT_META[q].token} />
                    </td>
                    <td className="max-w-[220px] px-4 py-2.5 text-muted-foreground">
                      <span className="line-clamp-1">{c.potentialGap || NF}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={
                          q === "direct_threat"
                            ? "risk"
                            : q === "watch_closely"
                            ? "warn"
                            : q === "adjacent"
                            ? "future"
                            : "neutral"
                        }
                      >
                        {QUADRANT_META[q].label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          Click a row for full detail. Scores are a ProofPilot interpretation based on reviewed sources.
        </p>
      </Card>

      <AnimatePresence>
        {open && <CompetitorDrawer competitor={open} onClose={() => setOpenName(null)} />}
      </AnimatePresence>
    </>
  );
}

function ScoreBar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: `hsl(var(${tone}))` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

function CompetitorDrawer({
  competitor: c,
  onClose,
}: {
  competitor: Competitor;
  onClose: () => void;
}) {
  const q = quadrantOf(c.productOverlap, c.marketActivitySignal);
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{c.name}</h3>
          <Badge variant={c.source === "user" ? "proven" : "outline"} className="text-[10px]">
            {c.source === "user" ? "user-supplied" : "AI-suggested"}
          </Badge>
        </div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-white/5">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 scroll-thin">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Product overlap" value={c.productOverlap} tone="--primary" />
          <StatBox label="Market activity" value={c.marketActivitySignal} tone={QUADRANT_META[q].token} />
        </div>
        <Badge
          variant={q === "direct_threat" ? "risk" : q === "watch_closely" ? "warn" : q === "adjacent" ? "future" : "neutral"}
        >
          {QUADRANT_META[q].label} · {QUADRANT_META[q].desc}
        </Badge>

        <Field label="Positioning" value={c.positioning} />
        <Field label="Target audience" value={c.targetAudience} />
        <Field label="Pricing model" value={c.pricingModel} />

        <div>
          <FieldLabel>Potential strengths</FieldLabel>
          {c.coreCapabilities.length ? (
            <ul className="mt-1.5 space-y-1">
              {c.coreCapabilities.map((cap, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {cap}
                </li>
              ))}
            </ul>
          ) : (
            <NotFound />
          )}
        </div>

        <Field label="Possible gap" value={c.potentialGap} />

        <div>
          <FieldLabel>Recent activity (24 mo)</FieldLabel>
          {c.activityLabel ? (
            <p className="mt-1.5 text-sm italic text-muted-foreground">{c.activityLabel}</p>
          ) : c.recentEvents.length ? (
            <ol className="mt-2 space-y-2 border-l border-border pl-4">
              {c.recentEvents.map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground">{e.date} · {e.eventType.replace(/_/g, " ")}</p>
                  <p className="text-sm">{e.title}</p>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary">
                      source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <NotFound />
          )}
        </div>

        <div>
          <FieldLabel>Sources reviewed</FieldLabel>
          {c.sources.length ? (
            <div className="mt-1.5 space-y-1.5">
              {c.sources.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border p-2 text-xs hover:border-primary/40"
                >
                  <span className="truncate text-foreground/90">{s.title}</span>
                  <span className="ml-2 flex shrink-0 items-center gap-1 text-primary">
                    {s.publisher} <ExternalLink className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <NotFound />
          )}
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <FieldLabel>Confidence notes</FieldLabel>
          <p className="mt-1 text-xs text-muted-foreground">
            {needsVerify(c)
              ? "AI-suggested or thinly sourced — treat as a hypothesis and verify against primary sources."
              : "Source-backed from reviewed public pages."}{" "}
            Last checked {formatDate(c.lastCheckedAt)}.
          </p>
        </div>
      </div>
    </motion.aside>
  );
}

function StatBox({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold tabular-nums" style={{ color: `hsl(var(${tone}))` }}>
          {value}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: `hsl(var(${tone}))` }} />
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</p>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {value ? (
        <p className="mt-1 text-sm text-foreground/90">{value}</p>
      ) : (
        <NotFound />
      )}
    </div>
  );
}

function NotFound() {
  return <p className="mt-1 text-sm italic text-muted-foreground">{NF}</p>;
}
