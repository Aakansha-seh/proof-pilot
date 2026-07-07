"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Extracting claims",
  "Identifying risky language",
  "Mapping evidence gaps",
  "Designing validation steps",
  "Preparing credible rewrites",
];

/**
 * Guided animated progression. Advances on a timer for a lively feel; when
 * `done` flips true it completes all steps. Purely visual.
 */
export function AnalysisLoader({ done = false }: { done?: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (done) {
      setActive(STEPS.length);
      return;
    }
    const id = setInterval(() => {
      setActive((a) => (a < STEPS.length - 1 ? a + 1 : a));
    }, 1100);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card/60 p-6">
      <p className="mb-4 text-sm font-medium">Running Evidence Audit…</p>
      <ul className="space-y-3">
        {STEPS.map((step, i) => {
          const state = i < active ? "done" : i === active ? "active" : "idle";
          return (
            <motion.li
              key={step}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 text-sm"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full border border-border">
                {state === "done" ? (
                  <Check className="h-3.5 w-3.5 text-[hsl(var(--proven))]" />
                ) : state === "active" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span
                className={
                  state === "idle" ? "text-muted-foreground" : "text-foreground"
                }
              >
                {step}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
