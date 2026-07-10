"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Sparkles,
  Rocket,
  Trophy,
  ScrollText,
  Briefcase,
  ArrowRight,
  Check,
  TriangleAlert,
  ShieldCheck,
  Lock,
  FileCheck,
  Gauge,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/app/disclaimer";
import { AnalysisLoader } from "@/components/claims/analysis-loader";
import { INPUT_TEMPLATES } from "@/lib/templates";
import { DEMO_PITCH } from "@/lib/demo-data";
import { useAudits } from "@/lib/store";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done" | "error";

/* ---------- Static config (UI only) ---------- */

const FEATURE_PILLS = [
  { label: "Competitors", dot: "hsl(var(--primary))" },
  { label: "Market Research", dot: "hsl(var(--proven))" },
  { label: "Evidence Check", dot: "hsl(262 60% 62%)" },
  { label: "Risk Analysis", dot: "hsl(var(--warn))" },
  { label: "Investor Readiness", dot: "hsl(var(--future))" },
];

const AUDIT_TYPES = [
  {
    id: "startup_pitch",
    title: "Startup Pitch",
    desc: "Investor pitch deck",
    Icon: Rocket,
    accent: "hsl(var(--primary))",
  },
  {
    id: "hackathon_submission",
    title: "Hackathon",
    desc: "Competition submission",
    Icon: Trophy,
    accent: "hsl(var(--warn))",
  },
  {
    id: "grant_application",
    title: "Grant Proposal",
    desc: "Funding application",
    Icon: ScrollText,
    accent: "hsl(var(--future))",
  },
  {
    id: "freelancer_proposal",
    title: "Freelancer Proposal",
    desc: "Client proposal",
    Icon: Briefcase,
    accent: "hsl(var(--proven))",
  },
] as const;

const EXAMPLE_PROMPTS = [
  {
    label: "AI SaaS startup",
    seed:
      "We're building an AI SaaS platform for [audience] that automates [workflow]. Today teams waste hours on [problem]. Our model reduces that by [amount]. We charge a monthly subscription and have [traction]. Our market is [TAM] and we're raising [amount].",
  },
  {
    label: "Healthcare platform",
    seed:
      "Our healthcare platform helps [patients/clinics] with [problem]. We [solution] and have improved [outcome] by [amount] in a pilot with [partner]. We monetize via [model], the addressable market is [TAM], and we're seeking [amount] to expand.",
  },
  {
    label: "Fintech",
    seed:
      "We're a fintech product for [audience] that makes [financial task] effortless. Users save [amount] and we process [volume]. Revenue comes from [model]. The market is [TAM] and we're raising [amount] to reach [milestone].",
  },
  {
    label: "AgriTech",
    seed:
      "Our AgriTech solution helps [farmers] increase yield by [amount] using [technology]. We reduce [input cost] and have deployed across [scale]. We earn revenue through [model]. Market size is [TAM]; we're raising [amount].",
  },
  {
    label: "Marketplace",
    seed:
      "We run a marketplace connecting [supply] with [demand]. We've reached [GMV] with [take rate]% take rate and [growth]. Our advantage is [moat]. The market is [TAM] and we're raising [amount] to scale liquidity.",
  },
];

const REPORT_INCLUDES = [
  "Competitor Analysis",
  "Market Validation",
  "Evidence Verification",
  "Risk Assessment",
  "Pitch Improvement",
  "Downloadable PDF",
];

const TRUST_BADGES = [
  { label: "Sources Included", Icon: FileCheck },
  { label: "Saved Locally", Icon: Lock },
  { label: "Private by Default", Icon: ShieldCheck },
  { label: "Investor Ready", Icon: Sparkles },
];

const SEED_STRINGS = new Set<string>([
  DEMO_PITCH,
  ...INPUT_TEMPLATES.map((t) => t.seed),
  ...EXAMPLE_PROMPTS.map((e) => e.seed),
  "",
]);

/* ---------- Lightweight client-side "AI" heuristics ---------- */

type Insight = { label: string; value: string; ok: boolean };

function useInsights(text: string) {
  return useMemo(() => {
    const t = text.toLowerCase();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    const pick = (pairs: [RegExp, string][], fallback: string): [string, boolean] => {
      for (const [re, val] of pairs) if (re.test(t)) return [val, true];
      return [fallback, false];
    };

    const [industry, indOk] = pick(
      [
        [/\b(ai|ml|machine learning|llm|saas)\b/, "AI / SaaS"],
        [/\b(health|clinic|patient|medical|care)\b/, "HealthTech"],
        [/\b(fintech|payment|bank|lending|finance)\b/, "FinTech"],
        [/\b(agri|farm|crop|yield)\b/, "AgriTech"],
        [/\b(marketplace|two-sided|gmv)\b/, "Marketplace"],
        [/\b(edtech|education|student|learn)\b/, "EdTech"],
        [/\b(climate|carbon|energy|sustainab)\b/, "ClimateTech"],
      ],
      "Detecting…"
    );

    const [stage, stageOk] = pick(
      [
        [/\bseries a\b/, "Series A"],
        [/\bseed\b/, "Seed"],
        [/\bpre-seed\b/, "Pre-Seed"],
        [/\bmvp\b/, "MVP"],
        [/\bprototype\b/, "Prototype"],
        [/\b(idea|concept)\b/, "Idea"],
        [/\b(growth|scal)\b/, "Growth"],
      ],
      "Unknown"
    );

    const [revenue, revOk] = pick(
      [
        [/\bsubscription|monthly|per month\b/, "Subscription"],
        [/\bfreemium\b/, "Freemium"],
        [/\btake rate|commission\b/, "Marketplace fee"],
        [/\busage-based|per (call|request|seat)\b/, "Usage-based"],
        [/\bads?|advertis/, "Advertising"],
        [/\brevenue|charge|pricing|paid\b/, "Paid product"],
      ],
      "Unknown"
    );

    const [audience, audOk] = pick(
      [
        [/\bstartups?\b/, "Startups"],
        [/\benterprise|b2b\b/, "Enterprise"],
        [/\bsmb|small business\b/, "SMBs"],
        [/\bdevelopers?\b/, "Developers"],
        [/\bpatients?|clinic/, "Patients / clinics"],
        [/\bstudents?|learners?\b/, "Students"],
        [/\bconsumers?|users?\b/, "Consumers"],
        [/\bfarmers?\b/, "Farmers"],
      ],
      "Unknown"
    );

    const [model, modelOk] = pick(
      [
        [/\bb2b\b/, "B2B"],
        [/\bb2c\b/, "B2C"],
        [/\bmarketplace\b/, "Marketplace"],
        [/\bsaas\b/, "SaaS"],
      ],
      revOk ? "Direct" : "Unknown"
    );

    const detected: Insight[] = [
      { label: "Industry", value: industry, ok: indOk },
      { label: "Stage", value: stage, ok: stageOk },
      { label: "Revenue", value: revenue, ok: revOk },
      { label: "Target Audience", value: audience, ok: audOk },
      { label: "Business Model", value: model, ok: modelOk },
    ];

    const missing: string[] = [];
    if (!/\b(tam|market size|\$?\d+\s?(b|bn|billion|m|million))\b/.test(t)) missing.push("Market size");
    if (!/\b(moat|advantage|differentiat|unique|proprietary)\b/.test(t)) missing.push("Competitive advantage");
    if (!revOk) missing.push("Revenue model");
    if (!/\b(traction|users|customers|revenue|growth|mrr|arr)\b/.test(t)) missing.push("Traction");

    const detectedCount = detected.filter((d) => d.ok).length;
    const clarity =
      words === 0
        ? 0
        : Math.min(
            98,
            Math.round(30 + detectedCount * 11 + Math.min(18, words / 12) - missing.length * 2)
          );

    return { detected, missing, clarity: Math.max(0, clarity), words };
  }, [text]);
}

export default function NewAuditPage() {
  const router = useRouter();
  const createAudit = useAudits((s) => s.createAudit);
  const addEvidence = useAudits((s) => s.addEvidence);

  const [text, setText] = useState(DEMO_PITCH);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [auditType, setAuditType] = useState<string>("startup_pitch");
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const insights = useInsights(text);
  const canRun = text.trim().length >= 20;

  const finish = (id: string) => router.push(`/app/audits/${id}`);

  // Seed the editor without clobbering real user input.
  const seedText = (seed: string) => {
    setText((current) => (SEED_STRINGS.has(current.trim()) || current.trim() === "" ? seed : current));
  };

  const selectAuditType = (id: string) => {
    setAuditType(id);
    const tpl = INPUT_TEMPLATES.find((t) => t.id === id);
    if (tpl) seedText(tpl.seed);
  };

  async function runTextAudit() {
    if (text.trim().length < 20) {
      setError("Add at least a couple of sentences to audit.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setStatus("done");
      const id = createAudit({
        title: deriveTitle(text),
        sourceType: "pasted_text",
        originalText: text,
        providerUsed: data.provider,
        audit: data.audit,
      });
      setTimeout(() => finish(id), 500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const handleFile = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase();
      const isImage = /\.(png|jpe?g|webp)$/.test(name);
      const isDoc = /\.(pdf|txt)$/.test(name);
      if (!isImage && !isDoc) {
        setError("Supported: PDF, TXT, PNG, JPG, JPEG, WEBP.");
        setStatus("error");
        return;
      }
      setStatus("loading");
      setError(null);
      try {
        if (isDoc) {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/documents/analyze", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Could not process document.");
          if (data.processing_status === "image_only") {
            setError(data.message);
            setStatus("error");
            return;
          }
          setStatus("done");
          const id = createAudit({
            title: file.name,
            sourceType: name.endsWith(".pdf") ? "pdf" : "txt",
            documentName: file.name,
            originalText: data.extracted_text,
            providerUsed: data.provider,
            audit: data.audit,
          });
          setTimeout(() => finish(id), 500);
        } else {
          // Image source: extract visible claims, then build a light audit.
          const fd = new FormData();
          fd.append("image", file);
          const res = await fetch("/api/analyze-image", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Image analysis failed.");
          const visibleText: string =
            data.analysis?.extracted_text ||
            (data.analysis?.visible_claims || []).join(". ");
          if (!visibleText || visibleText.length < 15) {
            setError(
              "No readable claims were found in this image. Try a clearer slide or paste the text."
            );
            setStatus("error");
            return;
          }
          // Run the claim engine on the extracted text.
          const auditRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: visibleText }),
          });
          const auditData = await auditRes.json();
          if (!auditRes.ok) throw new Error(auditData.error || "Analysis failed.");
          setStatus("done");
          const id = createAudit({
            title: file.name,
            sourceType: "image",
            documentName: file.name,
            originalText: visibleText,
            providerUsed: auditData.provider,
            audit: auditData.audit,
          });
          // Persist the image analysis as evidence (no image stored).
          addEvidence(id, {
            id: `ev_${Date.now().toString(36)}`,
            type: "image",
            status: "needs_review",
            fileName: file.name,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            extractedText: data.analysis?.extracted_text,
            evidenceSummary: data.analysis?.evidence_summary,
          });
          setTimeout(() => finish(id), 500);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setStatus("error");
      }
    },
    [addEvidence, createAudit] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (status === "loading" || status === "done") {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <AnalysisLoader done={status === "done"} />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[1180px]">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-72 overflow-hidden">
        <div className="absolute inset-0 aurora opacity-60" />
      </div>

      {/* ---------------- HERO ---------------- */}
      <section className="animate-fade-up pt-2 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          New Audit
        </div>
        <h1 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
          Validate your startup with evidence, not assumptions.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-7 text-muted-foreground">
          Paste your pitch or upload your deck. ProofPilot will verify claims, identify competitors,
          estimate market potential, assess risks, and generate an evidence-backed report.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {FEATURE_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: pill.dot }} />
              {pill.label}
            </span>
          ))}
        </div>
      </section>

      {/* ---------------- WORKSPACE ---------------- */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT COLUMN */}
        <div className="min-w-0 space-y-6">
          {/* Audit type cards */}
          <div>
            <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Audit type
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {AUDIT_TYPES.map(({ id, title, desc, Icon, accent }) => {
                const active = auditType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectAuditType(id)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-200",
                      "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? "border-primary/50 bg-primary/[0.07] shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_10px_30px_-14px_hsl(var(--primary)/0.6)]"
                        : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
                        style={{
                          borderColor: active ? accent : "hsl(var(--border))",
                          background: "hsl(var(--card))",
                          color: accent,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border transition-all",
                          active ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"
                        )}
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Premium editor */}
          <div
            className={cn(
              "rounded-2xl border bg-card/60 p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200",
              focused ? "border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]" : "border-border/70"
            )}
          >
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={"Describe your startup...\nor paste your complete pitch here."}
              className="min-h-[220px] resize-none border-0 bg-transparent px-4 py-3.5 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
            />
            <div className="flex flex-wrap items-center gap-2 px-3 pb-2.5 pt-1">
              <span className="text-xs text-muted-foreground/80">Try:</span>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => setText(ex.seed)}
                  className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {ex.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setText(DEMO_PITCH)}
                className="ml-auto inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                <Sparkles className="h-3 w-3" /> Demo pitch
              </button>
            </div>
            {/* AI typing indicator */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 pb-2 text-xs text-primary transition-opacity duration-300",
                text.trim().length > 0 ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
              </span>
              <Sparkles className="h-3.5 w-3.5" />
              AI understanding your startup…
            </div>
          </div>

          {/* Upload area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed p-8 text-center transition-all duration-200",
              dragging
                ? "border-primary bg-primary/[0.06] scale-[1.005]"
                : "border-border/70 bg-card/40 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/70"
            )}
          >
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
              <span
                className={cn(
                  "absolute inset-0 rounded-2xl bg-primary/15 blur-md transition-opacity",
                  dragging ? "animate-pulse opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-card">
                <UploadCloud className="h-6 w-6 text-primary" />
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold">
              {dragging ? "Release to upload" : "Drop your pitch deck"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag &amp; drop, or{" "}
              <span className="font-medium text-primary underline-offset-2 group-hover:underline">
                browse files
              </span>
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2 py-0.5">
                <FileText className="h-3 w-3" /> PDF
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2 py-0.5">
                <FileText className="h-3 w-3" /> TXT
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2 py-0.5">
                <ImageIcon className="h-3 w-3" /> PNG · JPG · WEBP
              </span>
            </div>
            <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-muted-foreground/80">
              We automatically extract claims, metrics, competitors and market assumptions.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-[hsl(var(--risk)/0.4)] bg-[hsl(var(--risk)/0.08)] p-3 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--risk))]" />
              <div>
                <p>{error}</p>
                <Badge variant="outline" className="mt-2 cursor-pointer" onClick={() => setStatus("idle")}>
                  Dismiss
                </Badge>
              </div>
            </div>
          )}

          {/* CTA section */}
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <div className="absolute inset-0 aurora opacity-30" aria-hidden />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Ready to validate?</h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                  Estimated analysis <span className="font-medium text-foreground">35–45 seconds</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {REPORT_INCLUDES.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-[hsl(var(--proven))]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={runTextAudit}
                  disabled={!canRun}
                  className={cn(
                    "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl px-7 text-base font-semibold text-primary-foreground transition-all duration-200",
                    "bg-gradient-to-r from-primary to-[hsl(199_89%_55%)] shadow-lg shadow-primary/25",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    canRun
                      ? "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
                      : "cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    Run Evidence Audit
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
                {!canRun && (
                  <p className="text-[11px] text-muted-foreground">Add a couple of sentences to begin.</p>
                )}
              </div>
            </div>

            {/* Trust badges */}
            <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-4">
              {TRUST_BADGES.map(({ label, Icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-[hsl(var(--proven))]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <Disclaimer />
        </div>

        {/* RIGHT COLUMN — Live AI Insights */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="glass rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary/70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <h3 className="text-sm font-semibold">Live AI Insights</h3>
                </div>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                AI detected
              </p>
              <dl className="mt-2 space-y-1.5">
                {insights.detected.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2"
                  >
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium",
                        row.ok ? "text-foreground" : "text-[hsl(var(--warn))]"
                      )}
                    >
                      {row.ok ? (
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--proven))]" />
                      ) : (
                        <TriangleAlert className="h-3.5 w-3.5" />
                      )}
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Missing information
              </p>
              {insights.missing.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {insights.missing.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--warn))]/30 bg-[hsl(var(--warn))]/10 px-2.5 py-1 text-xs text-[hsl(var(--warn))]"
                    >
                      <TriangleAlert className="h-3 w-3" />
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--proven))]/30 bg-[hsl(var(--proven))]/10 px-2.5 py-1 text-xs text-[hsl(var(--proven))]">
                  <Check className="h-3.5 w-3.5" /> Looks complete
                </div>
              )}

              <div className="mt-4 rounded-xl border border-border/50 bg-background/40 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Clarity score</span>
                  <span className="font-semibold tabular-nums">{insights.clarity}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(199_89%_55%)] transition-all duration-500 ease-out"
                    style={{ width: `${insights.clarity}%` }}
                  />
                </div>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updates as you type
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function deriveTitle(text: string): string {
  const firstLine = text.trim().split("\n")[0].replace(/[#*_>]/g, "").trim();
  const words = firstLine.split(/\s+/).slice(0, 6).join(" ");
  return words.length > 3 ? words : "Untitled audit";
}
