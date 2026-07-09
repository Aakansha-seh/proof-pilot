"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldQuestion } from "lucide-react";
import type { Competitor } from "@/lib/competitors/schema";
import {
  QUADRANT_META,
  quadrantOf,
  needsVerify,
  type Quadrant,
} from "@/lib/competitors/insight";
import { cn, formatDate } from "@/lib/utils";

// Interactive positioning map. X = product overlap, Y = market activity signal.
// The user's marker is 2-3x larger with a glow. Competitor points show a rich,
// evidence-first tooltip on hover/focus (works with keyboard too).
export function MomentumMap({
  competitors,
  selected,
  onSelect,
}: {
  competitors: Competitor[];
  selected?: string | null;
  onSelect?: (name: string | null) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const px = (v: number) => 6 + (v / 100) * 88; // left %
  const py = (v: number) => 6 + ((100 - v) / 100) * 88; // top %

  const corners: { q: Quadrant; pos: string }[] = [
    { q: "adjacent", pos: "left-3 top-3" },
    { q: "direct_threat", pos: "right-3 top-3 text-right" },
    { q: "low_priority", pos: "left-3 bottom-3" },
    { q: "watch_closely", pos: "right-3 bottom-3 text-right" },
  ];

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex gap-3">
        {/* Y axis label */}
        <div className="grid place-items-center">
          <span className="rotate-180 whitespace-nowrap text-[11px] text-muted-foreground [writing-mode:vertical-rl]">
            Market activity signal →
          </span>
        </div>

        {/* Plot area */}
        <div className="relative aspect-[16/10] w-full rounded-xl border border-border bg-[hsl(var(--background)/0.4)]">
          {/* Quadrant tints */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute left-1/2 right-0 top-0 h-1/2 bg-[hsl(var(--risk)/0.07)]" />
            <div className="absolute left-0 top-0 h-1/2 w-1/2 bg-[hsl(var(--future)/0.05)]" />
            <div className="absolute bottom-0 left-1/2 right-0 h-1/2 bg-[hsl(var(--warn)/0.05)]" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px border-l border-dashed border-border" />
          <div className="pointer-events-none absolute left-0 top-1/2 w-full border-t border-dashed border-border" />

          {/* Quadrant labels + descriptions */}
          {corners.map(({ q, pos }) => (
            <div
              key={q}
              className={cn("pointer-events-none absolute max-w-[44%]", pos)}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: `hsl(var(${QUADRANT_META[q].token}))` }}
              >
                {QUADRANT_META[q].label}
              </p>
              <p className="text-[10px] leading-tight text-muted-foreground">
                {QUADRANT_META[q].desc}
              </p>
            </div>
          ))}

          {/* "You" anchor — large, glowing */}
          <UserAnchor left={px(95)} top={py(22)} />

          {/* Competitor points */}
          {competitors.map((c, i) => {
            const q = quadrantOf(c.productOverlap, c.marketActivitySignal);
            const tone = QUADRANT_META[q].token;
            const isActive = hover === c.name || selected === c.name;
            const size = 13 + (c.marketActivitySignal / 100) * 11; // 13-24px
            const left = px(c.productOverlap);
            const top = py(c.marketActivitySignal);
            return (
              <div key={c.name}>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 260, damping: 18 }}
                  onMouseEnter={() => setHover(c.name)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(c.name)}
                  onBlur={() => setHover(null)}
                  onClick={() => onSelect?.(selected === c.name ? null : c.name)}
                  className="absolute rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: size,
                    height: size,
                    background: `hsl(var(${tone}))`,
                    boxShadow: isActive
                      ? `0 0 0 4px hsl(var(${tone}) / 0.25)`
                      : "0 1px 4px hsl(0 0% 0% / 0.4)",
                    transform: `translate(-50%,-50%) scale(${isActive ? 1.2 : 1})`,
                    zIndex: isActive ? 30 : 10,
                  }}
                  aria-label={`${c.name}: product overlap ${c.productOverlap}, market activity ${c.marketActivitySignal}`}
                />
                <span
                  className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-foreground/80"
                  style={{ left: `${left}%`, top: `calc(${top}% + ${size / 2 + 3}px)` }}
                >
                  {c.name}
                </span>
                {isActive && (
                  <Tooltip
                    competitor={c}
                    quadrant={q}
                    tone={tone}
                    left={left}
                    top={top}
                    size={size}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-1 pl-8 text-center text-[11px] text-muted-foreground">
        Product overlap →
      </p>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {(Object.keys(QUADRANT_META) as Quadrant[]).map((q) => (
          <span key={q} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: `hsl(var(${QUADRANT_META[q].token}))` }} />
            {QUADRANT_META[q].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full ring-2 ring-white" style={{ background: "hsl(var(--proven))" }} />
          Your startup
        </span>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
        Competitive positioning hypothesis based on reviewed public sources. Activity
        is not a measure of revenue or user growth.
      </p>
    </div>
  );
}

function Tooltip({
  competitor: c,
  quadrant,
  tone,
  left,
  top,
  size,
}: {
  competitor: Competitor;
  quadrant: Quadrant;
  tone: string;
  left: number;
  top: number;
  size: number;
}) {
  const evidence = c.overlapSummary || c.potentialGap;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute z-40 w-52 -translate-x-1/2 rounded-lg border border-border bg-card p-3 shadow-2xl"
      style={{
        left: `${Math.min(80, Math.max(20, left))}%`,
        top: `calc(${top}% - ${size / 2 + 8}px)`,
        transform: "translate(-50%,-100%)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">{c.name}</span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px]"
          style={{ background: `hsl(var(${tone}) / 0.15)`, color: `hsl(var(${tone}))` }}
        >
          {QUADRANT_META[quadrant].label}
        </span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <MiniStat label="Overlap" value={c.productOverlap} tone="--primary" />
        <MiniStat label="Activity" value={c.marketActivitySignal} tone={tone} />
      </div>
      {evidence && (
        <p className="mt-2 line-clamp-3 text-[10px] leading-relaxed text-muted-foreground">
          {evidence}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
        <span>
          {c.sources.length} source{c.sources.length === 1 ? "" : "s"}
        </span>
        <span>Checked {formatDate(c.lastCheckedAt)}</span>
      </div>
      {needsVerify(c) && (
        <div className="mt-1.5 flex items-center gap-1 text-[9px] text-[hsl(var(--warn))]">
          <ShieldQuestion className="h-3 w-3" /> Verify — AI-suggested or thinly sourced
        </div>
      )}
    </motion.div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: `hsl(var(${tone}))` }} />
      </div>
    </div>
  );
}

function UserAnchor({ left, top }: { left: number; top: number }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <span className="relative grid place-items-center">
        <span className="absolute h-10 w-10 animate-pulse-ring rounded-full bg-[hsl(var(--proven)/0.25)]" />
        <span className="absolute h-7 w-7 rounded-full bg-[hsl(var(--proven)/0.2)]" />
        <span className="h-5 w-5 rounded-full bg-[hsl(var(--proven))] ring-2 ring-white" />
      </span>
      <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-[hsl(var(--proven))]">
        Your startup
      </span>
    </motion.div>
  );
}