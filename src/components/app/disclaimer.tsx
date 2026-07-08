import { Info } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/70 ${className}`}
    >
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      <span>
        <span className="font-medium">Important:</span> ProofPilot identifies
        evidence gaps and risky language. Independently verify legal, medical,
        financial, and other high-stakes claims.
      </span>
    </p>
  );
}
