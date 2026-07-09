"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, FileWarning } from "lucide-react";
import type { SavedAudit, EvidencePackResponse } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CredibilityGauge } from "@/components/claims/credibility-gauge";
import { CATEGORY_LABEL, EVIDENCE_LABEL, RISK_BADGE } from "@/lib/claim-meta";
import { deriveLocalPack } from "@/lib/local-pack";
import { exportPackPdf } from "@/lib/pack-pdf";
import { formatDate } from "@/lib/utils";

export function EvidencePackView({ audit }: { audit: SavedAudit }) {
  const [pack, setPack] = useState<EvidencePackResponse | null>(null);
  const [exporting, setExporting] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);

  const auditString = JSON.stringify(audit.audit);

  useEffect(() => {
    let cancelled = false;
    // Try the live provider; fall back to a locally-derived pack.
    (async () => {
      try {
        const res = await fetch("/api/evidence-pack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audit: audit.audit }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error();
        if (!cancelled) setPack(data.pack);
      } catch {
        if (!cancelled) {
          setAiFailed(true);
          setPack(deriveLocalPack(audit.audit));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [audit.id, auditString]);

  if (!pack) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Compiling Evidence Pack…
      </div>
    );
  }

  return (
    <div>
      <div className="no-print mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Evidence Pack</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A report for judges, mentors, and founders.
          </p>
        </div>
        <Button onClick={async () => { setExporting(true); await exportPackPdf(audit, pack); setExporting(false); }}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export to PDF
        </Button>
      </div>

      {aiFailed && (
        <div className="no-print mb-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
          <FileWarning className="h-4 w-4" />
          Live provider unavailable — this pack was compiled locally from your audit.
        </div>
      )}

      {/* Print page */}
      <div className="print-page mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              ProofPilot Evidence Pack
            </p>
            <h2 className="mt-2 text-xl font-semibold">{audit.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(audit.createdAt)} · Provider: {audit.providerUsed.toUpperCase()} ·{" "}
              {audit.audit.claims.length} claims
            </p>
          </div>
          <CredibilityGauge score={audit.audit.overall_credibility_score} size={110} />
        </div>

        <Block title="Executive Summary">{pack.executive_summary}</Block>
        <Block title="Evidence Gap Analysis">{pack.evidence_gap_analysis}</Block>

        <section className="mt-6">
          <SectionTitle>Claim-by-Claim Analysis</SectionTitle>
          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Claim</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Risk</th>
                  <th className="p-3">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {audit.audit.claims.map((c) => (
                  <tr key={c.id} className="border-t border-border align-top">
                    <td className="p-3">{c.claim_text}</td>
                    <td className="p-3 text-muted-foreground">{CATEGORY_LABEL[c.claim_category]}</td>
                    <td className="p-3">
                      <Badge variant={RISK_BADGE[c.risk_level]}>{c.risk_level}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{EVIDENCE_LABEL[c.evidence_status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6">
          <SectionTitle>Validation Roadmap</SectionTitle>
          <ul className="mt-3 space-y-2">
            {pack.validation_roadmap.map((r, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-border p-3 text-sm">
                <Badge variant="future" className="shrink-0">{r.timeframe}</Badge>
                <div>
                  <p>{r.action}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Metric: {r.metric}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {audit.evidenceItems.length > 0 && (
          <section className="mt-6">
            <SectionTitle>Attached Evidence Notes</SectionTitle>
            <ul className="mt-3 space-y-2">
              {audit.evidenceItems.map((e) => (
                <li key={e.id} className="flex items-start gap-2 text-sm">
                  <Badge variant="neutral" className="shrink-0 capitalize">{e.status.replace(/_/g, " ")}</Badge>
                  <span className="text-foreground/90">
                    {e.note || e.evidenceSummary || e.url || e.fileName}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6">
          <SectionTitle>Next 7 Days</SectionTitle>
          <ol className="mt-3 space-y-1.5">
            {pack.next_7_days.map((n, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="font-semibold text-primary">{i + 1}.</span>
                <span className="text-foreground/90">{n}</span>
              </li>
            ))}
          </ol>
        </section>

        {audit.rewrittenPitch && (
          <Block title="Credible Rewritten Pitch">{audit.rewrittenPitch}</Block>
        )}

        <p className="mt-8 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          ProofPilot helps identify evidence gaps and risky language. Users should
          independently verify legal, medical, financial, and other high-stakes claims.
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
      {children}
    </h3>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <SectionTitle>{title}</SectionTitle>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{children}</p>
    </section>
  );
}
