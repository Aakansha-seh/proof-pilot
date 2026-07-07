"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Trash2,
  Pencil,
  FileText,
  FolderOpen,
  Plus,
  Check,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CredibilityRing } from "@/components/landing/claim-map-preview";
import { useMounted } from "@/components/app/use-mounted";
import { useAudits } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function MyAuditsPage() {
  const mounted = useMounted();
  const router = useRouter();
  const audits = useAudits((s) => s.audits);
  const renameAudit = useAudits((s) => s.renameAudit);
  const duplicateAudit = useAudits((s) => s.duplicateAudit);
  const deleteAudit = useAudits((s) => s.deleteAudit);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Audits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved on this device · {audits.length} total
          </p>
        </div>
        <Button asChild>
          <Link href="/app/new"><Plus className="h-4 w-4" /> New Audit</Link>
        </Button>
      </div>

      {audits.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No audits yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Run your first Evidence Audit and it will appear here, saved on this device.
          </p>
          <Button asChild className="mt-5">
            <Link href="/app/new">Audit My Claims</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {audits.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editing === a.id ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { renameAudit(a.id, draft || a.title); setEditing(null); }}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push(`/app/audits/${a.id}`)}
                      className="truncate text-left text-sm font-semibold hover:text-primary"
                    >
                      {a.title}
                    </button>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="neutral" className="capitalize">{a.sourceType.replace("_", " ")}</Badge>
                    <span>{a.audit.claims.length} claims</span>
                    <span>·</span>
                    <span>{formatDate(a.createdAt)}</span>
                    <Badge variant="outline" className="uppercase">{a.providerUsed}</Badge>
                  </div>
                </div>
                <CredibilityRing score={a.audit.overall_credibility_score} size={44} />
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => router.push(`/app/audits/${a.id}`)}>
                  <FolderOpen className="h-3.5 w-3.5" /> Open
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(a.id); setDraft(a.title); }}>
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { const nid = duplicateAudit(a.id); if (nid) router.refresh(); }}>
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/app/pack?id=${a.id}`}><FileText className="h-3.5 w-3.5" /> Export</Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-[hsl(var(--risk))]" onClick={() => deleteAudit(a.id)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
