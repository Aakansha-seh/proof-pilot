import { Info } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground ${className}`}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        ProofPilot helps identify evidence gaps and risky language. Users should
        independently verify legal, medical, financial, and other high-stakes
        claims.
      </span>
    </div>
  );
}
