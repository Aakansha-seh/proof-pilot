"use client";

import { type FormEvent, type ChangeEvent, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { ArrowRight, FileText, Sparkles, UploadCloud, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const options = [
  { title: "Competitor Analysis", value: "competitorAnalysis", description: "Discover existing competitors and market positioning." },
  { title: "Market Research", value: "marketResearch", description: "Estimate market opportunities and industry trends." },
  { title: "Risk Assessment", value: "riskAssessment", description: "Identify execution, market, and business risks." },
  { title: "Pitch Improvement", value: "pitchImprovements", description: "Improve clarity, storytelling, and investor readiness." },
  { title: "Evidence Validation", value: "evidenceValidation", description: "Verify claims using publicly available evidence." },
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
        <div class="meta meta-item"><strong>Startup Name:</strong> ${formData.startupName || "—"}</div>
        ${formData.oneLineIdea ? `<div class="meta meta-item"><strong>One-line Idea:</strong> ${formData.oneLineIdea}</div>` : ""}
        ${formData.industry ? `<div class="meta meta-item"><strong>Industry:</strong> ${formData.industry}</div>` : ""}
        ${formData.startupStage ? `<div class="meta meta-item"><strong>Startup Stage:</strong> ${formData.startupStage}</div>` : ""}
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
      }
    } catch {
      setErrors({ form: "Unable to reach the backend right now. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            ProofPilot
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Validate Your Startup with Evidence, Not Assumptions
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Upload your startup idea or investor pitch deck and receive an AI-powered validation report including:
            <span className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground sm:mt-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <span>• Competitor Analysis</span>
              <span>• Market Research</span>
              <span>• Evidence-backed Validation</span>
              <span>• Risk Assessment</span>
              <span>• Pitch Improvement Suggestions</span>
            </span>
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Startup Information</CardTitle>
              <CardDescription>
                Share the core details of your idea to structure the validation workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Startup Name</label>
                  <Input
                    placeholder="Enter your startup name"
                    value={formData.startupName}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, startupName: event.target.value }));
                      setErrors((current) => ({ ...current, startupName: "" }));
                    }}
                  />
                  {errors.startupName ? <p className="text-sm text-[hsl(var(--risk))]">{errors.startupName}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">One-line Idea</label>
                  <Input
                    placeholder="Summarize your startup in one sentence"
                    value={formData.oneLineIdea}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, oneLineIdea: event.target.value }));
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Problem Statement</label>
                <Textarea
                  placeholder="Describe the problem your startup solves and why it matters"
                  className="min-h-[100px]"
                  value={formData.problemStatement}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, problemStatement: event.target.value }));
                    setErrors((current) => ({ ...current, problemStatement: "" }));
                  }}
                />
                {errors.problemStatement ? <p className="text-sm text-[hsl(var(--risk))]">{errors.problemStatement}</p> : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input
                    placeholder="Who are your target users or customers?"
                    value={formData.targetAudience}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, targetAudience: event.target.value }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3.5 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.industry}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, industry: event.target.value }));
                    }}
                  >
                    <option value="">Select Industry</option>
                    <option>AI & SaaS</option>
                    <option>FinTech</option>
                    <option>HealthTech</option>
                    <option>EdTech</option>
                    <option>ClimateTech</option>
                    <option>E-commerce</option>
                    <option>Cybersecurity</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Revenue Model</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3.5 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.revenueModel}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, revenueModel: event.target.value }));
                    }}
                  >
                    <option value="">Select Revenue Model</option>
                    <option>Subscription</option>
                    <option>B2B SaaS</option>
                    <option>Marketplace</option>
                    <option>Freemium</option>
                    <option>Usage-based</option>
                    <option>Advertising</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Startup Stage</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3.5 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.startupStage}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, startupStage: event.target.value }));
                    }}
                  >
                    <option value="">Select Startup Stage</option>
                    <option>Idea Stage</option>
                    <option>Prototype</option>
                    <option>MVP</option>
                    <option>Pre-Seed</option>
                    <option>Seed</option>
                    <option>Series A</option>
                    <option>Growth</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Pitch</CardTitle>
                <CardDescription>
                  Add a pitch draft or upload a PDF deck for later analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={mode === "paste" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("paste")}
                  >
                    Paste pitch text
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("upload")}
                  >
                    Upload Pitch Deck (.pdf)
                  </Button>
                </div>

                {mode === "paste" ? (
                  <Textarea
                    placeholder="Paste your startup pitch here..."
                    className="min-h-[180px]"
                    value={formData.pitch}
                    onChange={(event) => {
                      setFormData((current) => ({ ...current, pitch: event.target.value }));
                    }}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-background/40 p-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {!uploadedFile ? (
                      <div className="text-center">
                        <UploadCloud className="mx-auto h-7 w-7 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">Upload your investor pitch deck (.pdf)</p>
                        <p className="mt-2 text-sm text-muted-foreground">Select a PDF to attach a copy of your pitch deck. Content analysis will be supported in a future update.</p>
                        {fileError ? (
                          <p className="mt-2 text-sm text-[hsl(var(--risk))]">{fileError}</p>
                        ) : null}
                        <div className="mt-4 flex items-center justify-center gap-3">
                          <Button variant="subtle" size="sm" onClick={openFilePicker}>
                            <FileText className="mr-2 h-4 w-4" /> Choose PDF
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-600/10 p-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground">Size: {formatFileSize(uploadedFile.size)}</p>
                            <p className="mt-1 text-sm text-green-500">PDF uploaded successfully. Content analysis will be supported in a future update.</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button size="sm" variant="outline" onClick={handleReplaceFile}>
                            Replace PDF
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleRemoveFile}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Analysis Options</CardTitle>
                <CardDescription>
                  Select the validation areas you want to explore.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5",
                        isSelected ? "border-primary/40 bg-primary/10" : "border-border/70 bg-background/40"
                      )}
                    >
                      <p className="text-sm font-medium">{option.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                      <div className="mt-3 h-2.5 w-2.5 rounded-full border border-primary/30 bg-transparent" />
                    </button>
                  );
                })}
                {errors.analysisOptions ? <p className="sm:col-span-2 text-sm text-[hsl(var(--risk))]">{errors.analysisOptions}</p> : null}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Ready to begin?</p>
                <p className="text-sm text-muted-foreground">
                  The button below is intentionally non-functional.
                </p>
              </div>
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Generate Evidence Report <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
                {errors.form ? <p className="text-sm text-[hsl(var(--risk))]">{errors.form}</p> : null}
                <p className="text-xs leading-5 text-muted-foreground">
                  AI-generated insights are intended for decision support only and should not be considered financial, legal, or investment advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm sm:p-8">
          {analysis ? (
            <div className="max-w-3xl space-y-6" id="proofpilot-report">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium text-foreground">Validation Report</h2>
                  {analysis.summary ? (
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{analysis.summary}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" variant="secondary" onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? "Downloading…" : "Download PDF"}
                  </Button>
                  <Button size="sm" variant="default" onClick={handlePrintReport} disabled={isPrinting}>
                    {isPrinting ? "Printing…" : "Print Report"}
                  </Button>
                </div>
              </div>

              {analysis.competitorAnalysis && analysis.competitorAnalysis.length > 0 ? (
                <div>
                  <h3 className="text-base font-medium text-foreground">Competitor Analysis</h3>
                  <ul className="mt-3 space-y-3">
                    {analysis.competitorAnalysis.map((item, index) => (
                      <li key={`${item.name || "competitor"}-${index}`} className="rounded-xl border border-border/70 bg-background/40 p-4">
                        <p className="text-sm font-medium text-foreground">{item.name || "Competitor"}</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description || "No description available."}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Strength:</span> {item.strength || "Unknown"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {analysis.marketResearch ? (
                <div>
                  <h3 className="text-base font-medium text-foreground">Market Research</h3>
                  <div className="mt-3 space-y-3 rounded-xl border border-border/70 bg-background/40 p-4 text-sm leading-7 text-muted-foreground">
                    {analysis.marketResearch.marketSize ? <p><span className="font-medium text-foreground">Market size:</span> {analysis.marketResearch.marketSize}</p> : null}
                    {analysis.marketResearch.targetAudience ? <p><span className="font-medium text-foreground">Target audience:</span> {analysis.marketResearch.targetAudience}</p> : null}
                    {analysis.marketResearch.industryTrend ? <p><span className="font-medium text-foreground">Industry trend:</span> {analysis.marketResearch.industryTrend}</p> : null}
                  </div>
                </div>
              ) : null}

              {analysis.riskAssessment && analysis.riskAssessment.length > 0 ? (
                <div>
                  <h3 className="text-base font-medium text-foreground">Risk Assessment</h3>
                  <ul className="mt-3 space-y-2">
                    {analysis.riskAssessment.map((item, index) => (
                      <li key={`${item}-${index}`} className="rounded-xl border border-border/70 bg-background/40 p-3 text-sm leading-7 text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {analysis.evidenceValidation && analysis.evidenceValidation.length > 0 ? (
                <div>
                  <h3 className="text-base font-medium text-foreground">Evidence Validation</h3>
                  <ul className="mt-3 space-y-3">
                    {analysis.evidenceValidation.map((item, index) => (
                      <li key={`${item.claim || "evidence"}-${index}`} className="rounded-xl border border-border/70 bg-background/40 p-4">
                        <p className="text-sm font-medium text-foreground">{item.claim || "Claim"}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.reason || item.explanation || item.reasoning || "No explanation available."}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Status:</span> {item.status || "Unknown"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {analysis.pitchImprovements && analysis.pitchImprovements.length > 0 ? (
                <div>
                  <h3 className="text-base font-medium text-foreground">Pitch Improvements</h3>
                  <ul className="mt-3 space-y-2">
                    {analysis.pitchImprovements.map((item, index) => (
                      <li key={`${item}-${index}`} className="rounded-xl border border-border/70 bg-background/40 p-3 text-sm leading-7 text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="max-w-2xl">
              <h2 className="text-lg font-medium text-foreground">Your validation report will appear here</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                After running the analysis, ProofPilot will generate:
              </p>
              <ul className="mt-3 space-y-1 text-sm leading-7 text-muted-foreground">
                <li>• Competitor Analysis</li>
                <li>• Market Research</li>
                <li>• Evidence Validation</li>
                <li>• Risk Assessment</li>
                <li>• Pitch Improvements</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                No report will be displayed until an actual analysis is performed.
              </p>
            </div>
          )}
        </section>
      </form>
    </main>
  );
}
