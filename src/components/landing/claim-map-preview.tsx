"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, HelpCircle, Clock } from "lucide-react";

const NODES = [
  { label: "Proven", icon: ShieldCheck, color: "var(--proven)", count: 1, delay: 0 },
  { label: "Needs Evidence", icon: HelpCircle, color: "var(--warn)", count: 2, delay: 0.1 },
  { label: "Risky Language", icon: AlertTriangle, color: "var(--risk)", count: 3, delay: 0.2 },
  { label: "Future Validation", icon: Clock, color: "var(--future)", count: 1, delay: 0.3 },
];

export function ClaimMapPreview() {
  return (
    <div className="glass relative w-full overflow-hidden rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Claim Map</p>
          <p className="text-sm font-semibold">startup-pitch.txt</p>
        </div>
        <CredibilityRing score={42} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {NODES.map((n) => (
          <motion.div
            key={n.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: n.delay }}
            className="rounded-xl border border-border bg-card/60 p-3"
          >
            <div className="flex items-center justify-between">
              <n.icon
                className="h-4 w-4"
                style={{ color: `hsl(${n.color})` }}
              />
              <span
                className="text-lg font-semibold tabular-nums"
                style={{ color: `hsl(${n.color})` }}
              >
                {n.count}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{n.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {[
          { t: "reduces prep time by 80%", c: "var(--risk)" },
          { t: "improves conversion by 3x", c: "var(--warn)" },
          { t: "guarantees every claim is accurate", c: "var(--risk)" },
        ].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: `hsl(${row.c})` }}
            />
            <span className="truncate text-xs text-muted-foreground">
              &ldquo;{row.t}&rdquo;
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CredibilityRing({
  score,
  size = 48,
}: {
  score: number;
  size?: number;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color =
    score >= 70 ? "var(--proven)" : score >= 45 ? "var(--warn)" : "var(--risk)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`hsl(${color})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (c * score) / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center text-xs font-semibold tabular-nums"
        style={{ color: `hsl(${color})` }}
      >
        {score}
      </span>
    </div>
  );
}
