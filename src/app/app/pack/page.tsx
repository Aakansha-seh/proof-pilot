"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EvidencePackView } from "@/components/claims/evidence-pack-view";
import { useMounted } from "@/components/app/use-mounted";
import { useAudits } from "@/lib/store";

function PackInner() {
  const params = useSearchParams();
  const mounted = useMounted();
  const audits = useAudits((s) => s.audits);
  const id = params.get("id");
  const audit = id ? audits.find((a) => a.id === id) : audits[0];

  if (!mounted) return null;

  if (!audit) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="flex flex-col items-center py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No audit to package yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Run an audit first, then generate a polished Evidence Pack here.
          </p>
          <Button asChild className="mt-5">
            <Link href="/app/new">Run an Audit</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <EvidencePackView audit={audit} />
    </div>
  );
}

export default function PackPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>}>
      <PackInner />
    </Suspense>
  );
}
