"use client";

import { useEffect, useState } from "react";
import { Cpu, ShieldCheck, Trash2, HardDrive, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/app/disclaimer";
import { useMounted } from "@/components/app/use-mounted";
import { useAudits } from "@/lib/store";

type Config = { provider: string; model: string; configured: boolean };

export default function SettingsPage() {
  const mounted = useMounted();
  const audits = useAudits((s) => s.audits);
  const deleteAudit = useAudits((s) => s.deleteAudit);
  const [cfg, setCfg] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then(setCfg).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Provider configuration, data, and safeguards.
      </p>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Active AI provider</h2>
        </div>
        {cfg ? (
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Provider">
              <Badge variant="default" className="uppercase">{cfg.provider}</Badge>
            </Row>
            <Row label="Model"><span className="font-mono text-xs">{cfg.model}</span></Row>
            <Row label="API key">
              {cfg.configured ? (
                <span className="flex items-center gap-1.5 text-[hsl(var(--proven))]">
                  <CheckCircle2 className="h-4 w-4" /> Configured
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[hsl(var(--warn))]">
                  <XCircle className="h-4 w-4" /> Not set — add it to .env.local
                </span>
              )}
            </Row>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Switch providers with <code className="rounded bg-secondary px-1">AI_PROVIDER=nvidia | fireworks | amd</code> in
          your environment. The core claim-analysis workload routes through the
          selected provider&rsquo;s OpenAI-compatible endpoint — including the AMD
          production inference path.
        </p>
      </Card>

      <Card className="mt-4 p-6">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Guest data</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {mounted ? audits.length : 0} audit(s) saved in this browser&rsquo;s
          localStorage. Nothing is sent to a server except the text you choose to analyze.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-4"
          disabled={!mounted || audits.length === 0}
          onClick={() => {
            if (confirm("Delete all saved audits on this device?")) {
              audits.forEach((a) => deleteAudit(a.id));
            }
          }}
        >
          <Trash2 className="h-4 w-4" /> Clear all audits
        </Button>
      </Card>

      <Card className="mt-4 p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[hsl(var(--proven))]" />
          <h2 className="text-sm font-semibold">Safeguards</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ProofPilot reports evidence status, support level, risk signals, and
          validation recommendations. It does not verify truth, fabricate sources,
          or browse the web unless you provide sources.
        </p>
        <Disclaimer className="mt-4" />
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
