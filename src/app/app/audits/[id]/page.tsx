"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Map, PenLine, Radar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClaimMap } from "@/components/claims/claim-map";
import { PitchRewrite } from "@/components/claims/pitch-rewrite";
import { CompetitiveIntel } from "@/components/competitors/competitive-intel";
import { EvidencePackView } from "@/components/claims/evidence-pack-view";
import { Disclaimer } from "@/components/app/disclaimer";
import { useMounted } from "@/components/app/use-mounted";
import { useAudits } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function AuditWorkspace({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const mounted = useMounted();
  const audit = useAudits((s) => s.audits.find((a) => a.id === id));
  const setRewrite = useAudits((s) => s.setRewrite);
  const [tab, setTab] = useState("map");

  if (!mounted) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!audit) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm text-muted-foreground">
          This audit could not be found on this device.
        </p>
        <Button asChild className="mt-4">
          <Link href="/app/audits">Back to My Audits</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app/audits")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{audit.title}</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(audit.createdAt)}</span>
              <span>·</span>
              <Badge variant="neutral" className="uppercase">{audit.providerUsed}</Badge>
              <span>·</span>
              <span>{audit.audit.claims.length} claims</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="map"><Map className="mr-1.5 h-4 w-4" /> Claim Map</TabsTrigger>
          <TabsTrigger value="rewrite"><PenLine className="mr-1.5 h-4 w-4" /> Rewrite</TabsTrigger>
          <TabsTrigger value="competitors"><Radar className="mr-1.5 h-4 w-4" /> Competitors</TabsTrigger>
          <TabsTrigger value="pack"><FileText className="mr-1.5 h-4 w-4" /> Evidence Pack</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <ClaimMap
            audit={audit.audit}
            auditId={audit.id}
            signals={audit.competitiveSignals}
            onUseRewrite={() => setTab("rewrite")}
            onAddToPack={() => setTab("pack")}
          />
          <Disclaimer className="mt-8" />
        </TabsContent>

        <TabsContent value="rewrite">
          <PitchRewrite
            original={audit.originalText}
            initialRewrite={audit.rewrittenPitch}
            onSave={(text) => setRewrite(audit.id, text)}
          />
        </TabsContent>

        <TabsContent value="competitors">
          <CompetitiveIntel
            audit={audit}
            onGoToRewrite={() => setTab("rewrite")}
            onGoToClaims={() => setTab("map")}
          />
        </TabsContent>

        <TabsContent value="pack">
          <EvidencePackView audit={audit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
