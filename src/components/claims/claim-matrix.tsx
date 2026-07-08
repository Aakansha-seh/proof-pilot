"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Grid3x3 } from "lucide-react";
import type { Claim } from "@/lib/schemas";
import { GROUP_META } from "@/lib/claim-meta";
import { matrixPoint } from "@/lib/claim-metrics";

// Signature visual: claims plotted by Evidence Strength (x) vs Risk Level (y).
// Top-left (low evidence, high risk) is the danger zone.
export function ClaimMatrix({
  claims,
  onOpen,
}: {
  claims: Claim[];
  onOpen: (id: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const px = (v: number) => 8 + (v / 100) * 84;
  const py = (v: number) => 8 + ((100 - v) / 100) * 84; // higher risk = higher up

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Grid3x3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Claim Confidence Matrix</h3>
        <span className="text-xs text-muted-foreground">Evidence strength vs risk</span>
      </div>
      <div className="mx-auto flex max-w-md gap-3">
        <div className="grid place-items-center">
          <span className="rotate-180 whitespace-nowrap text-[11px] text-muted-foreground [writing-mode:vertical-rl]">
            Risk level →
          </span>
        </div>
        <div className="relative aspect-[2/1] w-full rounded-xl border border-border bg-[hsl(var(--background)/0.4)]">
          {/* danger / safe tints */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute left-0 top-0 h-1/2 w-1/2 bg-[hsl(var(--risk)/0.10)]" />
            <div className="absolute bottom-0 right-0 h-1/2 w-1/2 bg-[hsl(var(--proven)/0.08)]" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px border-l border-dashed border-border" />
          <div className="pointer-events-none absolute left-0 top-1/2 w-full border-t border-dashed border-border" />

          <span className="pointer-events-none absolute left-3 top-2 text-[10px] font-medium text-[hsl(var(--risk))]">
            Fix first
          </span>
          <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-medium text-[hsl(var(--proven))]">
            Investor-safe
          </span>

          {claims.map((c, i) => {
            const { x, y } = matrixPoint(c);
            const tone = GROUP_META[c.group].token;
            const active = hover === c.id;
            const left = px(x);
            const top = py(y);
            return (
              <div key={c.id}>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.04, type: "spring", stiffness: 260, damping: 18 }}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(c.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => onOpen(c.id)}
                  className="absolute h-3.5 w-3.5 rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    background: `hsl(var(${tone}))`,
                    transform: `translate(-50%,-50%) scale(${active ? 1.5 : 1})`,
                    boxShadow: active ? `0 0 0 4px hsl(var(${tone}) / 0.25)` : "0 1px 3px hsl(0 0% 0% / 0.4)",
                    zIndex: active ? 20 : 10,
                  }}
                  aria-label={c.claim_text}
                />
                {active && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pointer-events-none absolute z-30 w-48 -translate-x-1/2 rounded-lg border border-border bg-card p-2.5 text-[11px] shadow-2xl"
                    style={{
                      left: `${Math.min(80, Math.max(20, left))}%`,
                      top: `calc(${top}% - 12px)`,
                      transform: "translate(-50%,-100%)",
                    }}
                  >
                    <p className="line-clamp-3 text-foreground/90">{c.claim_text}</p>
                    <p className="mt-1 text-muted-foreground">
                      {GROUP_META[c.group].label} · {c.risk_level} risk
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mx-auto mt-1 max-w-md pl-8 text-center text-[11px] text-muted-foreground">Evidence strength →</p>
    </div>
  );
}
