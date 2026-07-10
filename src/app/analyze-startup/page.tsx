"use client";

import { type FormEvent, type ChangeEvent, useMemo, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import {
  ArrowRight,
  FileText,
  Sparkles,
  UploadCloud,
  CheckCircle,
  Check,
  Users,
  TrendingUp,
  ShieldAlert,
  Mic,
  BadgeCheck,
  Activity,
  Gauge,
  Lock,
  ShieldCheck,
  Download,
  Printer,
  ScanLine,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/app/sidebar";
import { Header } from "@/components/app/header";
import { MobileNav } from "@/components/app/mobile-nav";
import { ProofPilotChat } from "@/components/chat/proofpilot-chat";
import { buildStartupContext } from "@/lib/chat-context";

const modules = [
  {
    value: "competitorAnalysis",
    title: "Competitor Map",
    benefit: "See who you're up against and where you can win.",
    Icon: Users,
  },
  {
    value: "marketResearch",
    title: "Market Signal",
    benefit: "Gauge real demand, market size, and momentum.",
    Icon: TrendingUp,
  },
  {
    value: "riskAssessment",
    title: "Risk Radar",
    benefit: "Surface execution and market risks early.",
    Icon: ShieldAlert,
  },
  {
    value: "pitchImprovements",
    title: "Pitch Coach",
    benefit: "Sharpen your story for the room that matters.",
    Icon: Mic,
  },
  {
    value: "evidenceValidation",
    title: "Evidence Check",
    benefit: "Back every claim with public, cited sources.",
    Icon: BadgeCheck,
  },
] as const;

const featurePills = [
  { label: "Competitors", Icon: Users },
  { label: "Market Signals", Icon: Activity },
  { label: "Pitch Score", Icon: Gauge },
];

const trustBadges = [
  { label: "Saved locally", Icon: Lock },
  { label: "Evidence-backed", Icon: BadgeCheck },
  { label: "No investor data shared", Icon: ShieldCheck },
];

type AnalysisData = {
  summary?: string;
  competitorAnalysis?: Array<{ name?: string; description?: string; strength?: string }>;
  marketResearch?: { marketSize?: string; targetAudience?: string; industryTrend?: string };
  riskAssessment?: string[];
  evidenceValidation?: Array<{
    claim?: string;
    status?: string;
    reason?: string;
    explanation?: string;
    reasoning?: string;
  }>;
  pitchImprovements?: string[];
};

const wordCount = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

export default function AnalyzeStartupPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [formData, setFormData] = useState({
    startupName: "",
    oneLineIdea: "",
    problemStatement: "",
    targetAudience: "",
    industry: "",
    revenueModel: "",
    startupStage: "",
    pitch: "",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDateTime = (date: Date) =>
    date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  // ----- Live validation preview (client-side, derived from inputs) -----
  const preview = useMemo(() => {
    const { startupName, oneLineIdea, problemStatement, targetAudience, industry, revenueModel, startupStage } =
      formData;

    let clarity = 0;
    if (startupName.trim()) clarity += 18;
    if (oneLineIdea.trim()) clarity += Math.min(34, 14 + wordCount(oneLineIdea) * 2.5);
    if (problemStatement.trim()) clarity += Math.min(48, 14 + wordCount(problemStatement) * 1.6);
    clarity = Math.min(100, Math.round(clarity));

    const audienceWords = wordCount(targetAudience);
    const audience = audienceWords === 0 ? 0 : Math.min(100, 28 + audienceWords * 11);

    const fields = [
      { label: "Startup Name", value: startupName },
      { label: "One-line Idea", value: oneLineIdea },
      { label: "Problem Statement", value: problemStatement },
      { label: "Target Audience", value: targetAudience },
      { label: "Industry", value: industry },
      { label: "Revenue Model", value: revenueModel },
      { label: "Startup Stage", value: startupStage },
    ];
    const filled = fields.filter((field) => field.value.trim()).length;
    const missing = fields.filter((field) => !field.value.trim()).map((field) => field.label);
    if (selected.length === 0) missing.push("At least one module");

    const readiness = Math.round(
      (filled / fields.length) * 70 + (Math.min(selected.length, 5) / 5) * 30
    );

    return {
      clarity,
      audience,
      market: industry.trim() || "Detecting…",
      missing,
      readiness: Math.min(100, readiness),
    };
  }, [formData, selected]);

  const reportScore = useMemo(() => {
    if (!analysis) return 0;
    let score = 54;
    if (analysis.competitorAnalysis?.length) score += 10;
    if (analysis.marketResearch) score += 10;
    if (analysis.riskAssessment?.length) score += 8;
    if (analysis.evidenceValidation?.length) score += 9;
    if (analysis.pitchImprovements?.length) score += 8;
    return Math.min(97, score);
  }, [analysis]);

  const createPdf = () => {
    if (!analysis) return;

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxWidth = width - margin * 2;
    const lineHeight = 16;
    let cursorY = margin;

    const addPageIfNeeded = (needed = lineHeight * 2) => {
      if (cursorY + needed > height - margin) {
        doc.addPage();
        cursorY = margin;
      }
    };

    const addHeading = (text: string) => {
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      addPageIfNeeded(lineHeight * 2);
      doc.text(text, margin, cursorY, { maxWidth });
      cursorY += lineHeight * 2;
    };

    const addSubheading = (text: string) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      addPageIfNeeded(lineHeight * 1.5);
      doc.text(text, margin, cursorY, { maxWidth });
      cursorY += lineHeight * 1.5;
    };

    const addParagraph = (text: string) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, maxWidth);
      addPageIfNeeded(lines.length * lineHeight);
      doc.text(lines, margin, cursorY, { maxWidth });
      cursorY += lines.length * lineHeight + lineHeight * 0.5;
    };

    const addBulletList = (items: string[]) => {
      items.forEach((item) => {
        const lines = doc.splitTextToSize(item, maxWidth - 12);
        addPageIfNeeded(lines.length * lineHeight);
        doc.text([`• ${lines[0]}`], margin, cursorY, { maxWidth });
        cursorY += lineHeight;
        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i += 1) {
            addPageIfNeeded(lineHeight);
            doc.text(lines[i], margin + 12, cursorY, { maxWidth: maxWidth - 12 });
            cursorY += lineHeight;
          }
        }
        cursorY += lineHeight * 0.25;
      });
      cursorY += lineHeight * 0.5;
    };

    const addKeyValue = (label: string, value?: string) => {
      if (!value) return;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      addPageIfNeeded(lineHeight);
      doc.text(`${label}:`, margin, cursorY, { maxWidth });
      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(value, maxWidth - labelWidth);
      if (lines.length > 0) {
        doc.text(lines, margin + labelWidth, cursorY, { maxWidth: maxWidth - labelWidth });
      }
      cursorY += lines.length * lineHeight + lineHeight * 0.25;
    };

    addHeading("Startup Validation Report");
    addSubheading("Startup Details");
    addKeyValue("Startup Name", formData.startupName || "—");
    addKeyValue("One-line Idea", formData.oneLineIdea || undefined);
    addKeyValue("Industry", formData.industry || undefined);
    addKeyValue("Startup Stage", formData.startupStage || undefined);
    addKeyValue("Validation Score", `${reportScore} / 100`);
    addKeyValue("Report Generated", formatDateTime(new Date()));

    if (analysis.summary) {
      addSubheading("Summary");
      addParagraph(analysis.summary);
    }

    if (analysis.competitorAnalysis && analysis.competitorAnalysis.length > 0) {
      addSubheading("Competitor Analysis");
      analysis.competitorAnalysis.forEach((item) => {
        const title = item.name || "Competitor";
        const description = item.description || "No description available.";
        const strength = item.strength ? `Strength: ${item.strength}` : "";
        addParagraph(`${title}`);
        addParagraph(description);
        if (strength) addParagraph(strength);
      });
    }

    if (analysis.marketResearch) {
      addSubheading("Market Research");
      if (analysis.marketResearch.marketSize) addKeyValue("Market size", analysis.marketResearch.marketSize);
      if (analysis.marketResearch.targetAudience) addKeyValue("Target audience", analysis.marketResearch.targetAudience);
      if (analysis.marketResearch.industryTrend) addKeyValue("Industry trend", analysis.marketResearch.industryTrend);
    }

    if (analysis.riskAssessment && analysis.riskAssessment.length > 0) {
      addSubheading("Risk Assessment");
      addBulletList(analysis.riskAssessment);
    }

    if (analysis.evidenceValidation && analysis.evidenceValidation.length > 0) {
      addSubheading("Evidence Validation");
      analysis.evidenceValidation.forEach((item) => {
        const claim = item.claim || "Claim";
        const reason = item.reason || item.explanation || item.reasoning || "No explanation available.";
        const status = item.status ? `Status: ${item.status}` : "Status: Unknown";
        addParagraph(claim);
        addParagraph(reason);
        addParagraph(status);
      });
    }

    if (analysis.pitchImprovements && analysis.pitchImprovements.length > 0) {
      addSubheading("Pitch Improvements");
      addBulletList(analysis.pitchImprovements);
    }

    const fileName = `proofpilot-validation-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      createPdf();
    } finally {
      setIsDownloading(false);
    }
  };

  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handlePrintReport = () => {
    if (!analysis) return;
    setIsPrinting(true);

    const reportTitle = "Startup Validation Report";
    const now = formatDateTime(new Date());
    const html = `<!doctype html><html><head><title>${reportTitle}</title><style>
      body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;margin:24px;}
      h1{font-size:28px;margin-bottom:12px;}
      h2{font-size:18px;margin-top:28px;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;}
      p, li{font-size:13px;line-height:1.6;margin:0 0 12px 0;}
      .section{margin-bottom:18px;}
      .meta{margin-bottom:14px;}
      .meta-item{margin-bottom:6px;}
      .box{border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc;}
      ul{padding-left:20px;margin:0;}
      li{margin-bottom:8px;}
      .claim{font-weight:700;margin-bottom:4px;}
      .status{font-weight:600;margin-top:6px;}
    </style></head><body>
      <h1>${reportTitle}</h1>
      <div class="section box">
        <div class="meta meta-item"><strong>Startup Name:</strong> ${escapeHtml(formData.startupName || "—")}</div>
        ${formData.oneLineIdea ? `<div class="meta meta-item"><strong>One-line Idea:</strong> ${escapeHtml(formData.oneLineIdea)}</div>` : ""}
        ${formData.industry ? `<div class="meta meta-item"><strong>Industry:</strong> ${escapeHtml(formData.industry)}</div>` : ""}
        ${formData.startupStage ? `<div class="meta meta-item"><strong>Startup Stage:</strong> ${escapeHtml(formData.startupStage)}</div>` : ""}
        <div class="meta meta-item"><strong>Validation Score:</strong> ${reportScore} / 100</div>
        <div class="meta meta-item"><strong>Report Generated:</strong> ${now}</div>
      </div>
      ${analysis.summary ? `<div class="section"><h2>Summary</h2><div class="box"><p>${analysis.summary}</p></div></div>` : ""}
      ${analysis.competitorAnalysis && analysis.competitorAnalysis.length > 0 ? `<div class="section"><h2>Competitor Analysis</h2>${analysis.competitorAnalysis
        .map((item) => `<div class="box"><p class="claim">${item.name || "Competitor"}</p><p>${item.description || "No description available."}</p>${item.strength ? `<p class="status">Strength: ${item.strength}</p>` : ""}</div>`)
        .join("")}</div>` : ""}
      ${analysis.marketResearch ? `<div class="section"><h2>Market Research</h2><div class="box">${analysis.marketResearch.marketSize ? `<p><strong>Market size:</strong> ${analysis.marketResearch.marketSize}</p>` : ""}${analysis.marketResearch.targetAudience ? `<p><strong>Target audience:</strong> ${analysis.marketResearch.targetAudience}</p>` : ""}${analysis.marketResearch.industryTrend ? `<p><strong>Industry trend:</strong> ${analysis.marketResearch.industryTrend}</p>` : ""}</div></div>` : ""}
      ${analysis.riskAssessment && analysis.riskAssessment.length > 0 ? `<div class="section"><h2>Risk Assessment</h2><div class="box"><ul>${analysis.riskAssessment.map((item) => `<li>${item}</li>`).join("")}</ul></div></div>` : ""}
      ${analysis.evidenceValidation && analysis.evidenceValidation.length > 0 ? `<div class="section"><h2>Evidence Validation</h2>${analysis.evidenceValidation
        .map((item) => `<div class="box"><p class="claim">${item.claim || "Claim"}</p><p>${item.reason || item.explanation || item.reasoning || "No explanation available."}</p><p class="status">Status: ${item.status || "Unknown"}</p></div>`)
        .join("")}</div>` : ""}
      ${analysis.pitchImprovements && analysis.pitchImprovements.length > 0 ? `<div class="section"><h2>Pitch Improvements</h2><div class="box"><ul>${analysis.pitchImprovements.map((item) => `<li>${item}</li>`).join("")}</ul></div></div>` : ""}
    </body></html>`;

    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
    setIsPrinting(false);
  };

  const openFilePicker = () => {
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Please select a PDF file (.pdf).");
      setUploadedFile(null);
      e.currentTarget.value = "";
      return;
    }
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileError("File is too large. Please upload a PDF smaller than 10 MB.");
      setUploadedFile(null);
      e.currentTarget.value = "";
      return;
    }
    setUploadedFile(file);
    setFileError(null);
  };

  const handleReplaceFile = () => openFilePicker();

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleOption = (option: string) => {
    setSelected((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    );
    setErrors((current) => ({ ...current, analysisOptions: "" }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setAnalysis(null);

    const payload = {
      startupName: formData.startupName.trim(),
      oneLineIdea: formData.oneLineIdea.trim(),
      problemStatement: formData.problemStatement.trim(),
      targetAudience: formData.targetAudience.trim(),
      industry: formData.industry,
      revenueModel: formData.revenueModel,
      startupStage: formData.startupStage,
      // If a PDF has been uploaded, send a placeholder string indicating upload; backend parsing is not implemented yet.
      pitch: uploadedFile ? "[PDF_UPLOADED]" : formData.pitch.trim(),
      analysisOptions: selected,
    };

    try {
      const response = await fetch("/api/analyze-startup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors || { form: result.message || "Please review the form and try again." });
        return;
      }

      if (result?.analysis && typeof result.analysis === "object") {
        setAnalysis(result.analysis as AnalysisData);
        requestAnimationFrame(() => {
          document.getElementById("proofpilot-report")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    } catch {
      setErrors({ form: "Unable to reach the backend right now. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    "flex h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header />

        {/* Ambient background field */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
          <div className="absolute inset-0 aurora opacity-70" />
          <div className="absolute inset-0 bg-grid" />
        </div>

        <main className="flex-1 overflow-y-auto px-4 pb-40 pt-8 sm:px-6 lg:px-10">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-6xl flex-col gap-10">
            {/* ---------------- 1. HERO ---------------- */}
            <section className="animate-fade-up pt-2 text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                ProofPilot AI Validation
              </div>
              <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
                Validate your startup with evidence, not assumptions.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
                Describe your idea, choose your modules, and ProofPilot builds an evidence-backed
                validation report from public sources — in about a minute.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                {featurePills.map(({ label, Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {label}
                  </span>
                ))}
              </div>
            </section>

            {/* ---------------- 2. WORKSPACE ---------------- */}
            <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              {/* LEFT — Step 1: describe */}
              <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                <StepHeader
                  index={1}
                  title="Describe your startup"
                  subtitle="The clearer your inputs, the sharper the evidence."
                />

                <div className="mt-7 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Startup Name" error={errors.startupName}>
                      <Input
                        placeholder="e.g. ProofPilot"
                        value={formData.startupName}
                        onChange={(event) => {
                          setFormData((current) => ({ ...current, startupName: event.target.value }));
                          setErrors((current) => ({ ...current, startupName: "" }));
                        }}
                      />
                    </Field>
                    <Field label="One-line Idea">
                      <Input
                        placeholder="Summarize it in one sentence"
                        value={formData.oneLineIdea}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, oneLineIdea: event.target.value }))
                        }
                      />
                    </Field>
                  </div>

                  <Field label="Problem Statement" error={errors.problemStatement}>
                    <Textarea
                      placeholder="What problem do you solve, and why does it matter now?"
                      className="min-h-[104px] resize-none"
                      value={formData.problemStatement}
                      onChange={(event) => {
                        setFormData((current) => ({ ...current, problemStatement: event.target.value }));
                        setErrors((current) => ({ ...current, problemStatement: "" }));
                      }}
                    />
                  </Field>

                  <Field label="Target Audience">
                    <Input
                      placeholder="Who exactly are your users or customers?"
                      value={formData.targetAudience}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, targetAudience: event.target.value }))
                      }
                    />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="Industry">
                      <select
                        className={selectClass}
                        value={formData.industry}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, industry: event.target.value }))
                        }
                      >
                        <option value="">Select</option>
                        <option>AI &amp; SaaS</option>
                        <option>FinTech</option>
                        <option>HealthTech</option>
                        <option>EdTech</option>
                        <option>ClimateTech</option>
                        <option>E-commerce</option>
                        <option>Cybersecurity</option>
                        <option>Other</option>
                      </select>
                    </Field>
                    <Field label="Revenue Model">
                      <select
                        className={selectClass}
                        value={formData.revenueModel}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, revenueModel: event.target.value }))
                        }
                      >
                        <option value="">Select</option>
                        <option>Subscription</option>
                        <option>B2B SaaS</option>
                        <option>Marketplace</option>
                        <option>Freemium</option>
                        <option>Usage-based</option>
                        <option>Advertising</option>
                        <option>Other</option>
                      </select>
                    </Field>
                    <Field label="Startup Stage">
                      <select
                        className={selectClass}
                        value={formData.startupStage}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, startupStage: event.target.value }))
                        }
                      >
                        <option value="">Select</option>
                        <option>Idea Stage</option>
                        <option>Prototype</option>
                        <option>MVP</option>
                        <option>Pre-Seed</option>
                        <option>Seed</option>
                        <option>Series A</option>
                        <option>Growth</option>
                      </select>
                    </Field>
                  </div>

                  {/* Pitch (optional) */}
                  <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className={labelClass}>Pitch <span className="normal-case text-muted-foreground/70">· optional</span></p>
                      <div className="inline-flex rounded-lg border border-border/70 bg-card/60 p-0.5">
                        <button
                          type="button"
                          onClick={() => setMode("paste")}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                            mode === "paste" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Paste text
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode("upload")}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                            mode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Upload PDF
                        </button>
                      </div>
                    </div>

                    {mode === "paste" ? (
                      <Textarea
                        placeholder="Paste your pitch here…"
                        className="mt-3 min-h-[96px] resize-none"
                        value={formData.pitch}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, pitch: event.target.value }))
                        }
                      />
                    ) : (
                      <div className="mt-3 rounded-lg border border-dashed border-border/70 bg-background/40 p-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {!uploadedFile ? (
                          <div className="text-center">
                            <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
                            <p className="mt-2 text-sm font-medium">Upload your pitch deck (.pdf)</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Attached for reference. Content parsing arrives in a future update.
                            </p>
                            {fileError ? <p className="mt-2 text-xs text-[hsl(var(--risk))]">{fileError}</p> : null}
                            <Button variant="subtle" size="sm" className="mt-3" onClick={openFilePicker}>
                              <FileText className="mr-2 h-4 w-4" /> Choose PDF
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="rounded-full bg-[hsl(var(--proven))]/10 p-2">
                                <CheckCircle className="h-4 w-4 text-[hsl(var(--proven))]" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                              </div>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <Button size="sm" variant="outline" onClick={handleReplaceFile}>Replace</Button>
                              <Button size="sm" variant="ghost" onClick={handleRemoveFile}>Remove</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT — Step 2: modules + live preview */}
              <div className="flex flex-col gap-6">
                <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                  <StepHeader
                    index={2}
                    title="Choose your validation modules"
                    subtitle="Pick the angles you want evidence on."
                  />

                  <div className="mt-7 grid gap-3.5 sm:grid-cols-2">
                    {modules.map(({ value, title, benefit, Icon }) => {
                      const isSelected = selected.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleOption(value)}
                          className={cn(
                            "group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            isSelected
                              ? "border-primary/50 bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_8px_30px_-12px_hsl(var(--primary)/0.5)]"
                              : "border-border/70 bg-background/40 hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                                isSelected
                                  ? "border-primary/40 bg-primary/15 text-primary"
                                  : "border-border/70 bg-card/60 text-muted-foreground group-hover:text-foreground"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <span
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border/80 bg-transparent text-transparent"
                              )}
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          </div>
                          <p className="mt-3 text-sm font-semibold">{title}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{benefit}</p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.analysisOptions ? (
                    <p className="mt-3 text-sm text-[hsl(var(--risk))]">{errors.analysisOptions}</p>
                  ) : null}
                </div>

                {/* Live Validation Preview */}
                <LivePreview preview={preview} selectedCount={selected.length} />
              </div>
            </section>

            {/* ---------------- 5/6. REPORT ---------------- */}
            <section id="proofpilot-report" className="scroll-mt-24">
              {analysis ? (
                <GeneratedReport
                  analysis={analysis}
                  formData={formData}
                  reportScore={reportScore}
                  isDownloading={isDownloading}
                  isPrinting={isPrinting}
                  onDownload={handleDownloadPdf}
                  onPrint={handlePrintReport}
                />
              ) : (
                <EmptyReport />
              )}
            </section>
          </form>
        </main>

        {/* ---------------- 4. STICKY CTA ---------------- */}
        <div className="pointer-events-none sticky bottom-0 z-20 px-4 pb-4 sm:px-6 lg:px-10">
          <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_-8px_40px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {trustBadges.map(({ label, Icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-[hsl(var(--proven))]" />
                  {label}
                </span>
              ))}
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Usually takes 30–60 seconds · Public sources included
                </span>
                <Button
                  size="lg"
                  type="submit"
                  form={undefined}
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Analyzing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Generate Evidence Report <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
              {errors.form ? <p className="text-xs text-[hsl(var(--risk))]">{errors.form}</p> : null}
            </div>
          </div>
        </div>

        <MobileNav />
      </div>

      <ProofPilotChat
        ready={!!analysis}
        scopeKey={analysis ? formData.startupName || "report" : "empty"}
        subtitle={
          analysis
            ? `${formData.startupName || "Your startup"} · this report only`
            : "Generate a report to start"
        }
        intro="Ask me about your validation report — competitors, market, risks, evidence, or how to sharpen your pitch. I only use this report's data."
        starters={[
          "Summarize this report",
          "Who are my closest competitors?",
          "What are my biggest risks?",
          "How do I improve my pitch?",
        ]}
        context={
          analysis
            ? buildStartupContext(analysis, {
                startupName: formData.startupName,
                oneLineIdea: formData.oneLineIdea,
                problemStatement: formData.problemStatement,
                targetAudience: formData.targetAudience,
                industry: formData.industry,
                revenueModel: formData.revenueModel,
                startupStage: formData.startupStage,
              })
            : ""
        }
      />
    </div>
  );
}

/* =====================================================================
   Sub-components
   ===================================================================== */

function StepHeader({ index, title, subtitle }: { index: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
        {index}
      </span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
      {error ? <p className="text-xs text-[hsl(var(--risk))]">{error}</p> : null}
    </div>
  );
}

type PreviewData = {
  clarity: number;
  audience: number;
  market: string;
  missing: string[];
  readiness: number;
};

function LivePreview({ preview, selectedCount }: { preview: PreviewData; selectedCount: number }) {
  return (
    <div className="animate-fade-up glass rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <h3 className="text-sm font-semibold">Live Validation Preview</h3>
        </div>
        <span className="text-xs text-muted-foreground">{selectedCount} module{selectedCount === 1 ? "" : "s"}</span>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <ProgressRing value={preview.readiness} />
        <div className="min-w-0 flex-1 space-y-3">
          <Meter label="Startup clarity" value={preview.clarity} />
          <Meter label="Audience specificity" value={preview.audience} />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <dt className="text-xs text-muted-foreground">Market category</dt>
          <dd className="mt-1 truncate font-medium">{preview.market}</dd>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <dt className="text-xs text-muted-foreground">Report readiness</dt>
          <dd className="mt-1 font-medium">{preview.readiness}%</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-xs text-muted-foreground">
          {preview.missing.length === 0 ? "Nothing missing — ready to generate." : "Missing inputs"}
        </p>
        {preview.missing.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {preview.missing.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--warn))]/30 bg-[hsl(var(--warn))]/10 px-2.5 py-1 text-xs text-[hsl(var(--warn))]"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--proven))]/30 bg-[hsl(var(--proven))]/10 px-2.5 py-1 text-xs text-[hsl(var(--proven))]">
            <CheckCircle className="h-3.5 w-3.5" /> All set
          </div>
        )}
      </div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(199_89%_55%)] transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(224 76% 60%)" />
            <stop offset="100%" stopColor="hsl(199 89% 55%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold tabular-nums">{value}%</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">ready</span>
      </div>
    </div>
  );
}

function EmptyReport() {
  const chips = ["Competitors", "Market", "Risks", "Pitch"];
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-14 text-center">
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-card/80 shadow-sm">
          <ScanLine className="h-7 w-7 text-primary" />
          <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </span>
        </div>
      </div>
      <h3 className="mt-6 text-lg font-semibold">Your validation report will appear here</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Fill in your startup details, choose your modules, and generate to see an evidence-backed
        breakdown with citations.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-border/70 bg-background/50 px-3 py-1 text-xs text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

type FormShape = {
  startupName: string;
  oneLineIdea: string;
  problemStatement: string;
  targetAudience: string;
  industry: string;
  revenueModel: string;
  startupStage: string;
  pitch: string;
};

function GeneratedReport({
  analysis,
  formData,
  reportScore,
  isDownloading,
  isPrinting,
  onDownload,
  onPrint,
}: {
  analysis: AnalysisData;
  formData: FormShape;
  reportScore: number;
  isDownloading: boolean;
  isPrinting: boolean;
  onDownload: () => void;
  onPrint: () => void;
}) {
  const scoreLabel = reportScore >= 80 ? "Strong signal" : reportScore >= 65 ? "Promising" : "Early signal";
  return (
    <div className="animate-fade-up space-y-6">
      {/* Executive summary + score */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="absolute inset-0 aurora opacity-40" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <BadgeCheck className="h-3.5 w-3.5" /> Evidence Report
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              {formData.startupName || "Your startup"}
            </h2>
            {analysis.summary ? (
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{analysis.summary}</p>
            ) : (
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Executive summary of your validation across the selected modules.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="sm" variant="secondary" onClick={onDownload} disabled={isDownloading}>
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading…" : "Download PDF"}
              </Button>
              <Button size="sm" variant="outline" onClick={onPrint} disabled={isPrinting}>
                <Printer className="mr-2 h-4 w-4" />
                {isPrinting ? "Printing…" : "Print"}
              </Button>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center rounded-2xl border border-border/70 bg-background/50 p-5">
            <ScoreGauge value={reportScore} />
            <span className="mt-2 text-xs font-medium text-primary">{scoreLabel}</span>
            <span className="text-[11px] text-muted-foreground">Validation score</span>
          </div>
        </div>
      </div>

      {/* Competitor comparison cards */}
      {analysis.competitorAnalysis && analysis.competitorAnalysis.length > 0 ? (
        <ReportSection title="Competitor Comparison" Icon={Users}>
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.competitorAnalysis.map((item, index) => (
              <div
                key={`${item.name || "competitor"}-${index}`}
                className="rounded-xl border border-border/70 bg-background/40 p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{item.name || "Competitor"}</p>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description || "No description available."}
                </p>
                {item.strength ? (
                  <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground/80">
                    <span className="font-medium text-primary">Strength · </span>
                    {item.strength}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </ReportSection>
      ) : null}

      {/* Market opportunity */}
      {analysis.marketResearch ? (
        <ReportSection title="Market Opportunity" Icon={TrendingUp}>
          <div className="grid gap-3 sm:grid-cols-3">
            <MarketStat label="Market size" value={analysis.marketResearch.marketSize} />
            <MarketStat label="Target audience" value={analysis.marketResearch.targetAudience} />
            <MarketStat label="Industry trend" value={analysis.marketResearch.industryTrend} />
          </div>
        </ReportSection>
      ) : null}

      {/* Risk radar */}
      {analysis.riskAssessment && analysis.riskAssessment.length > 0 ? (
        <ReportSection title="Risk Radar" Icon={ShieldAlert}>
          <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
            <RiskRadar count={analysis.riskAssessment.length} />
            <ul className="space-y-2">
              {analysis.riskAssessment.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-3 rounded-xl border border-border/70 bg-background/40 p-3 text-sm leading-6 text-muted-foreground"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--warn))]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </ReportSection>
      ) : null}

      {/* Evidence citations */}
      {analysis.evidenceValidation && analysis.evidenceValidation.length > 0 ? (
        <ReportSection title="Evidence Citations" Icon={Quote}>
          <ul className="space-y-3">
            {analysis.evidenceValidation.map((item, index) => {
              const status = (item.status || "unknown").toLowerCase();
              const tone =
                status.includes("prov") || status.includes("support") || status.includes("valid")
                  ? "proven"
                  : status.includes("risk") || status.includes("false") || status.includes("unsupported")
                  ? "risk"
                  : "warn";
              return (
                <li
                  key={`${item.claim || "evidence"}-${index}`}
                  className="rounded-xl border border-border/70 bg-background/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{item.claim || "Claim"}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                        tone === "proven" && "border-[hsl(var(--proven))]/30 bg-[hsl(var(--proven))]/10 text-[hsl(var(--proven))]",
                        tone === "risk" && "border-[hsl(var(--risk))]/30 bg-[hsl(var(--risk))]/10 text-[hsl(var(--risk))]",
                        tone === "warn" && "border-[hsl(var(--warn))]/30 bg-[hsl(var(--warn))]/10 text-[hsl(var(--warn))]"
                      )}
                    >
                      {item.status || "Unknown"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.reason || item.explanation || item.reasoning || "No explanation available."}
                  </p>
                </li>
              );
            })}
          </ul>
        </ReportSection>
      ) : null}

      {/* Pitch recommendations */}
      {analysis.pitchImprovements && analysis.pitchImprovements.length > 0 ? (
        <ReportSection title="Pitch Improvement Recommendations" Icon={Mic}>
          <ol className="space-y-2">
            {analysis.pitchImprovements.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex gap-3 rounded-xl border border-border/70 bg-background/40 p-3 text-sm leading-6 text-muted-foreground"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </ReportSection>
      ) : null}

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onDownload} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading…" : "Download PDF"}
        </Button>
      </div>
    </div>
  );
}

function ReportSection({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-7">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MarketStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm leading-6 text-foreground/90">{value || "—"}</p>
    </div>
  );
}

function ScoreGauge({ value }: { value: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative h-28 w-28">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(224 76% 60%)" />
            <stop offset="100%" stopColor="hsl(152 60% 45%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function RiskRadar({ count }: { count: number }) {
  const axes = ["Market", "Execution", "Competition", "Financial", "Timing"];
  const base = Math.min(0.9, 0.34 + count * 0.11);
  const offsets = [0, -0.12, 0.08, -0.06, 0.14];
  const size = 168;
  const center = size / 2;
  const maxR = size / 2 - 22;

  const point = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r] as const;
  };

  const values = axes.map((_, i) => Math.max(0.2, Math.min(0.95, base + offsets[i])));
  const polygon = values.map((v, i) => point(i, v * maxR).join(",")).join(" ");
  const rings = [0.33, 0.66, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto shrink-0">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, i) => point(i, ring * maxR).join(",")).join(" ")}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, maxR);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth="1" />;
      })}
      <polygon points={polygon} fill="hsl(var(--warn) / 0.18)" stroke="hsl(var(--warn))" strokeWidth="1.5" />
      {values.map((v, i) => {
        const [x, y] = point(i, v * maxR);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--warn))" />;
      })}
      {axes.map((label, i) => {
        const [x, y] = point(i, maxR + 12);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            fontSize="9"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
