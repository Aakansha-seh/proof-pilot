"use client";

import {
  Target,
  Lightbulb,
  Plus,
  Check,
  ShieldCheck,
  ExternalLink,
  CalendarClock,
} from "lucide-react";
import type { CompetitiveIntelResponse } from "@/lib/competitors/schema";
import type { StrategyTask } from "@/lib/schemas";
import {
  buildChecklist,
  buildStrategyMeta,
  type ChecklistItem,
} from "@/lib/competitors/insight";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAudits } from "@/lib/store";
import { uid, formatDate } from "@/lib/utils";

function getValidationPlanText(w: any) {
  const plan = w.validationPlan || w.mustValidate;
  if (!plan || plan === "true" || plan === "false" || plan === true || plan === false) {
    return "Run a small user study or survey to compare your solution against existing alternatives.";
  }
  return plan;
}

function getSupportingEvidenceText(w: any) {
  const evidence = w.supportingEvidence;
  if (!evidence || evidence.trim() === "") {
    return "Based on gaps identified in competitor pricing and official feature documentation.";
  }
  return evidence;
}

// ---- 6. Strategy Action Area ----------------------------------------------
const EMPTY_TASKS: StrategyTask[] = [];

export function StrategyArea({
  intel,
  auditId,
}: {
  intel: CompetitiveIntelResponse;
  auditId: string;
}) {
  const meta = buildStrategyMeta(intel);
  const checklist = buildChecklist(intel);
  const tasks =
    useAudits((s) => s.audits.find((a) => a.id === auditId)?.strategyTasks) ??
    EMPTY_TASKS;
  const addTask = useAudits((s) => s.addStrategyTask);
  const toggleTask = useAudits((s) => s.toggleStrategyTask);

  const added = new Set(tasks.map((t) => t.text));

  return (
    <div className="space-y-4">
      {/* Meta header */}
      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Differentiation" value={meta.differentiation} />
          <Meta
            label="Competitor overlap"
            value={meta.overlap}
            tone={meta.overlap === "High" ? "--risk" : meta.overlap === "Medium" ? "--warn" : "--proven"}
          />
          <Meta label="Market outlook" value={meta.outlook} />
          <Meta
            label="Defensibility"
            value={meta.defensibility}
            tone={meta.defensibility === "Weak" ? "--risk" : meta.defensibility === "Emerging" ? "--warn" : "--proven"}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Whitespace hypotheses */}
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[hsl(var(--proven))]" />
            <h3 className="text-sm font-semibold">Whitespace hypothesis</h3>
          </div>
          <div className="mt-3 space-y-3">
            {intel.whitespace.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No clear whitespace surfaced in reviewed sources.
              </p>
            )}
            {intel.whitespace.map((w, i) => (
              <div key={i} className="rounded-lg border border-border p-3 text-sm">
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge variant="proven" className="text-[10px]">Potential whitespace</Badge>
                  <Badge variant="neutral" className="text-[10px]">Hypothesis to validate</Badge>
                </div>
                <p className="font-medium">{w.hypothesis}</p>
                <p className="mt-1.5 text-muted-foreground">
                  <span className="text-foreground/80">Why it may be underserved: </span>{w.whyOpen}
                </p>
                <p className="mt-1 text-muted-foreground">
                  <span className="text-foreground/80">Based on reviewed sources: </span>{getSupportingEvidenceText(w)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  <span className="text-foreground/80">Validation needed: </span>{getValidationPlanText(w)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* What must you prove to win */}
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">What must you prove to win?</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Suggested validation steps — add the ones you'll commit to.
          </p>

          <div className="mt-3 space-y-2">
            {checklist.map((item, i) => (
              <ChecklistRow
                key={i}
                item={item}
                added={added.has(item.text)}
                onAdd={() =>
                  addTask(auditId, {
                    id: uid("task"),
                    text: item.text,
                    proofType: item.proofType,
                    priority: item.priority,
                    owner: item.owner,
                    effort: item.effort,
                    done: false,
                    createdAt: new Date().toISOString(),
                  })
                }
              />
            ))}
          </div>

          {tasks.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--proven))]" />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your validation plan ({tasks.filter((t) => t.done).length}/{tasks.length})
                </p>
              </div>
              <div className="mt-2 space-y-1.5">
                {tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTask(auditId, t.id)}
                    className="flex w-full items-center gap-2 rounded-lg border border-border p-2.5 text-left text-sm hover:border-primary/40"
                  >
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
                        t.done ? "border-[hsl(var(--proven))] bg-[hsl(var(--proven))]" : "border-border"
                      }`}
                    >
                      {t.done && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <span className={t.done ? "text-muted-foreground line-through" : ""}>{t.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Meta({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium" style={tone ? { color: `hsl(var(${tone}))` } : undefined}>
        {value}
      </p>
    </div>
  );
}

function ChecklistRow({
  item,
  added,
  onAdd,
}: {
  item: ChecklistItem;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm">{item.text}</p>
        <Button size="sm" variant={added ? "ghost" : "secondary"} disabled={added} onClick={onAdd}>
          {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {added ? "Added" : "Add to plan"}
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge variant="neutral" className="text-[10px]">{item.proofType}</Badge>
        <Badge
          variant={item.priority === "high" ? "risk" : item.priority === "medium" ? "warn" : "neutral"}
          className="text-[10px]"
        >
          {item.priority} priority
        </Badge>
        <Badge variant="outline" className="text-[10px]">Owner: {item.owner}</Badge>
        <Badge variant="outline" className="text-[10px]">{item.effort}</Badge>
      </div>
    </div>
  );
}

function safeHostname(urlStr: string): string {
  try {
    const url = urlStr.startsWith("http") ? urlStr : `https://${urlStr}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

// ---- 7. Sources and Timeline ----------------------------------------------
export function SourcesTimeline({ intel }: { intel: CompetitiveIntelResponse }) {
  const events = [...intel.timeline].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Sources & timeline (last 24 months)</h3>
      </div>

      {events.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No dated public events found in reviewed sources.
        </p>
      ) : (
        <ol className="mt-4 space-y-3 border-l border-border pl-4">
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{e.date}</span>
                <Badge variant="outline" className="text-[10px]">{e.eventType.replace(/_/g, " ")}</Badge>
                <span className="text-xs font-medium">{e.competitor}</span>
              </div>
              <p className="mt-0.5 text-sm text-foreground/90">{e.title}</p>
              {e.url && (
                <a href={e.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary">
                  {safeHostname(e.url)} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground">
        Last checked {formatDate(intel.meta.generatedAt)}. Market Activity Signal is
        based on recent public signals such as product updates, hiring, news, and
        publishing activity. It is not a measure of revenue, valuation, or user growth.
      </p>
    </Card>
  );
}
