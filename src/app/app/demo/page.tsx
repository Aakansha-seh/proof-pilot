"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle, Sparkles, ArrowRight, Copy, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ClaimMap } from "@/components/claims/claim-map";
import { AnalysisLoader } from "@/components/claims/analysis-loader";
import { CredibilityGauge } from "@/components/claims/credibility-gauge";
import { DEMO_AUDIT, DEMO_PITCH, DEMO_REWRITE } from "@/lib/demo-data";

export default function DemoPage() {
  const [phase, setPhase] = useState<"intro" | "running" | "results">("intro");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (phase !== "running") return;
    const t = setTimeout(() => setPhase("results"), 5200);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/8 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          Demo data shown. Live analysis is available in production mode.
        </div>
        <Button asChild size="sm">
          <Link href="/app/new">Try Live Audit <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      {phase === "intro" && (
        <Card className="p-8">
          <Badge variant="neutral" className="mb-4">Demo Mode</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            Watch ProofPilot audit a real pitch
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This runs on pre-generated results, so the presentation stays reliable
            even if an API is unavailable. No live data or uploaded images are used.
          </p>
          <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-foreground/90">
            {DEMO_PITCH}
          </div>
          <Button size="lg" className="mt-6" onClick={() => setPhase("running")}>
            <PlayCircle className="h-4 w-4" /> Run demo audit
          </Button>
        </Card>
      )}

      {phase === "running" && (
        <div className="py-12">
          <AnalysisLoader />
        </div>
      )}

      {phase === "results" && (
        <Tabs defaultValue="map">
          <TabsList>
            <TabsTrigger value="map">Claim Map</TabsTrigger>
            <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
            <TabsTrigger value="pack">Evidence Pack</TabsTrigger>
          </TabsList>

          <TabsContent value="map">
            <ClaimMap audit={DEMO_AUDIT} />
          </TabsContent>

          <TabsContent value="rewrite">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Original Pitch
                </p>
                <Textarea readOnly value={DEMO_PITCH} className="min-h-[260px] bg-secondary/20" />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[hsl(var(--proven))]">
                  Evidence-Aware Rewrite
                </p>
                <Textarea readOnly value={DEMO_REWRITE} className="min-h-[260px] border-[hsl(var(--proven)/0.3)]" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => { navigator.clipboard.writeText(DEMO_REWRITE); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy Rewrite
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pack">
            <Card className="p-8">
              <div className="flex items-start justify-between border-b border-border pb-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-primary">
                    ProofPilot Evidence Pack · Preview
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">Demo Startup Pitch</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sample report · {DEMO_AUDIT.claims.length} claims
                  </p>
                </div>
                <CredibilityGauge score={DEMO_AUDIT.overall_credibility_score} size={110} />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-foreground/90">
                {DEMO_AUDIT.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {DEMO_AUDIT.top_risks.map((r, i) => (
                  <Badge key={i} variant="risk">{r}</Badge>
                ))}
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/app/new">Generate a real Evidence Pack</Link>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
