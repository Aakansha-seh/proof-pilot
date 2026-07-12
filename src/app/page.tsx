"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";
import {
  ArrowRight,
  ScanSearch,
  ShieldAlert,
  ListChecks,
  PenLine,
  FileCheck2,
  Cpu,
  Sparkles,
  Gauge,
  Building2,
  Users,
  Wrench,
  GitCompare,
  BadgeCheck,
  Clock,
  Search,
  Check,
  Lock,
  Zap,
  Rocket,
  CheckCircle2,
  TrendingUp,
  Target,
  Compass,
  DollarSign,
  Route,
  Shield,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  Terminal,
  RefreshCw,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: EASE },
};

/* ================================================================ */
export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020408]">
      {/* Background Lighting & Particles */}
      <Background mousePosition={mousePosition} />

      <Nav />
      <Hero />
      <Playground />
      <SocialProof />
      <StartupOS />
      <WorkflowJourney />
      <InteractiveClaimAudit />
      <EvidenceEngine />
      <Results />
      <ArchitecturePipeline />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------------- Background Orbs & Particles ---------------- */
function Background({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

  useEffect(() => {
    const arr = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      duration: Math.random() * 12 + 10,
    }));
    setParticles(arr);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-noise mix-blend-overlay" />
      <div className="absolute inset-x-0 top-0 h-[840px] bg-grid opacity-60" />
      <div className="absolute inset-0 aurora animate-drift opacity-50" />
      <div
        className="cursor-glow hidden transition-transform duration-100 ease-out md:block"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/15 blur-[0.5px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: ["0vh", "-100vh"],
            x: ["0vw", Math.random() > 0.5 ? "8vw" : "-8vw"],
            opacity: [0, 0.4, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-[#020408]/60 backdrop-blur-xl border-b border-border/20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:flex">
          <a href="#playground" className="transition-colors hover:text-foreground">Playground</a>
          <a href="#startup-os" className="transition-colors hover:text-foreground">Startup OS</a>
          <a href="#workflow" className="transition-colors hover:text-foreground">Journey</a>
          <a href="#claim-audit" className="transition-colors hover:text-foreground">Claim Audit</a>
          <a href="#architecture" className="transition-colors hover:text-foreground">Pipeline</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
            <Link href="/analyze-startup">Analyze Startup</Link>
          </Button>
          <Button asChild size="sm" className="relative overflow-hidden group bg-primary text-primary-foreground font-semibold px-4">
            <Link href="/app/new" className="flex items-center gap-1.5">
              Audit Claims <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Magnetic Button Helper ---------------- */
function MagneticButton({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 150 });
  const springY = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX * 0.25);
    y.set(mouseY * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          The AI Evidence Engine for Early-Stage Startups
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
          className="mt-6 text-balance text-5xl font-bold leading-[1.02] tracking-tight text-gradient sm:text-6xl lg:text-[4.25rem]"
        >
          Validate your startup. Prove your claims.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.14 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
        >
          ProofPilot helps you validate your startup before you build it and prove every
          claim before you pitch it. We turn raw vision into investor-ready evidence.
        </motion.p>

        {/* Premium Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.22 }}
          className="mt-10 grid gap-4 sm:grid-cols-2"
        >
          <MagneticButton className="relative rounded-2xl border border-primary/20 bg-primary/[0.02] p-5 hover:bg-primary/[0.04] transition-colors cursor-pointer group">
            <Link href="/analyze-startup" className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Rocket className="h-6 w-6" />
              </span>
              <span className="min-w-0 text-left">
                <span className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                  Analyze startup
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-xs text-muted-foreground leading-normal">
                  Validate market size, moat, pricing model, and risk profiles before coding.
                </span>
              </span>
            </Link>
          </MagneticButton>

          <MagneticButton className="relative rounded-2xl border border-border bg-card/10 p-5 hover:bg-card/25 transition-colors cursor-pointer group">
            <Link href="/app/new" className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-105">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <span className="min-w-0 text-left">
                <span className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                  Audit my claims
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-xs text-muted-foreground leading-normal">
                  Scan deck paragraphs. Classify statements and find data sources.
                </span>
              </span>
            </Link>
          </MagneticButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.34 }}
          className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60"
        >
          <Lock className="h-3.5 w-3.5 text-primary/70" />
          No registration required · Guest Mode active · All inputs saved locally
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
      >
        <HeroDemo />
      </motion.div>
    </section>
  );
}

/* ---------------- Hero demo (Tabbed Simulation) ---------------- */
function HeroDemo() {
  const [tab, setTab] = useState<"startup" | "audit">("startup");

  return (
    <div className="relative">
      <div className="glow-radial pointer-events-none absolute -inset-14 -z-10 opacity-30 blur-3xl animate-drift" />
      <div className="glass overflow-hidden rounded-[2rem] p-5 shadow-2xl border-border/40 relative">
        <div className="absolute inset-0 pointer-events-none animate-shimmer" />

        {/* Tab Toggle Header */}
        <div className="mb-5 flex items-center justify-between border-b border-border/20 pb-4">
          <div className="flex rounded-full border border-border/50 bg-background/50 p-1 text-xs font-semibold">
            <button
              onClick={() => setTab("startup")}
              className={`relative rounded-full px-4 py-2 transition-colors ${
                tab === "startup" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "startup" && (
                <motion.span
                  layoutId="heroTabBg"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">Startup Analysis</span>
            </button>
            <button
              onClick={() => setTab("audit")}
              className={`relative rounded-full px-4 py-2 transition-colors ${
                tab === "audit" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "audit" && (
                <motion.span
                  layoutId="heroTabBg"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">Claim Audit</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Live Engine</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "startup" ? (
            <motion.div
              key="startup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <HeroStartupPanel />
            </motion.div>
          ) : (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <HeroAuditPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HeroStartupPanel() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(0, 84, {
        duration: 1.5,
        ease: EASE,
        onUpdate: (v) => setScore(Math.round(v)),
      });
      return () => controls.stop();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-background/30 rounded-xl p-3.5 border border-border/20">
        <Ring score={score} token="--proven" size={68} />
        <div>
          <p className="text-[10px] font-mono text-primary uppercase tracking-wider">AI Diagnostic Result</p>
          <h3 className="text-lg font-bold tracking-tight text-foreground">Excellent Market Signal</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">High defensibility and solid ICP validation mapping.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/20 bg-background/20 p-3">
          <p className="text-[10px] text-muted-foreground font-mono">Market Validation</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">92%</span>
            <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ delay: 0.5, duration: 1 }} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/20 bg-background/20 p-3">
          <p className="text-[10px] text-muted-foreground font-mono">Moat Defensibility</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">78%</span>
            <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: "78%" }} transition={{ delay: 0.6, duration: 1 }} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {[
          { label: "Competitor positioning", val: "High Differentiation / Quadrant 1" },
          { label: "Risks Flagged", val: "Pricing overlap detected in SaaS tier" },
          { label: "ICP Fit", val: "Seed founders & high-growth builders" },
          { label: "GTM suggestions", val: "PLG + community hubs" },
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-border/10">
            <span className="text-muted-foreground font-medium">{item.label}</span>
            <span className="text-foreground font-semibold">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroAuditPanel() {
  const [rewrittenText, setRewrittenText] = useState("");
  const targetText = "Early-stage pilots saw pitch preparation drop significantly with higher investor meeting conversions.";

  useEffect(() => {
    const t2 = setTimeout(() => {
      let i = 0;
      const typingTimer = setInterval(() => {
        if (i < targetText.length) {
          setRewrittenText((prev) => prev + targetText.charAt(i));
          i++;
        } else {
          clearInterval(typingTimer);
        }
      }, 25);
      return () => clearInterval(typingTimer);
    }, 800);

    return () => clearTimeout(t2);
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative border border-border/20 bg-background/40 rounded-xl p-3.5 overflow-hidden">
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Document Scanner Pitch.txt</p>
        <p className="mt-2 text-xs leading-relaxed text-foreground/80 font-mono">
          Our software <span className="highlight-unsupported text-[hsl(var(--risk))]">reduces pitch prep time by 80%</span> and <span className="highlight-buzzword text-[hsl(var(--warn))]">guarantees investor funding</span> on the very first meeting.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border/20 bg-background/20 p-3 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-mono">Unsupported Claims</p>
            <p className="text-base font-bold text-[hsl(var(--risk))] mt-0.5">2 detected</p>
          </div>
          <ShieldAlert className="h-5 w-5 text-[hsl(var(--risk))]" />
        </div>
        <div className="border border-border/20 bg-background/20 p-3 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-mono">Confidence Level</p>
            <p className="text-base font-bold text-[hsl(var(--warn))] mt-0.5">42%</p>
          </div>
          <Gauge className="h-5 w-5 text-[hsl(var(--warn))]" />
        </div>
      </div>

      <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-3.5 border-dashed">
        <p className="text-[10px] uppercase font-mono text-emerald-500 tracking-wider flex items-center gap-1.5">
          <PenLine className="h-3.5 w-3.5" /> Suggested rewrite
        </p>
        <p className="mt-2 text-xs text-foreground/90 leading-relaxed min-h-[2.5rem] italic">
          {rewrittenText || <span className="text-muted-foreground/30 font-mono">Generating rewrite...</span>}
        </p>
      </div>
    </div>
  );
}

function Ring({ score, token, size = 64 }: { score: number; token: string; size?: number }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border)/0.5)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`hsl(var(${token}))`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums" style={{ color: `hsl(var(${token}))` }}>
        {score}
      </span>
    </div>
  );
}

/* ---------------- Live Playground Section (Centerpiece) ---------------- */
function Playground() {
  const [activeMode, setActiveMode] = useState<"startup" | "claim">("startup");
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);

  const startupPlaceholder = "A mobile health app that uses AI to analyze patient genome variations and predict clinical trial matches.";
  const claimPlaceholder = "Our platform is 100% accurate and guarantees 10x faster recruitment with no dropouts.";

  useEffect(() => {
    setInputText("");
    setCompleted(false);
    setIsAnalyzing(false);
    setResults(null);
  }, [activeMode]);

  const runAnalysis = () => {
    if (isAnalyzing) return;
    const finalVal = inputText.trim() || (activeMode === "startup" ? startupPlaceholder : claimPlaceholder);
    setIsAnalyzing(true);
    setCompleted(false);
    setAnalysisStep(0);

    const stepDuration = 700;
    const totalSteps = 5;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnalysisStep(currentStep);
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setCompleted(true);
          // Generate mock response based on text content
          if (activeMode === "startup") {
            setResults({
              score: 86,
              market: "High ($2.4B Addressable)",
              competition: "Medium (3 mapped)",
              moat: "Highly defensible integration",
              risk: "Low-Med regulatory blockages",
              recommendation: "Focus first on institutional clinical centers, setting up direct integration models.",
            });
          } else {
            setResults({
              violations: 2,
              confidence: 18,
              unsupported: ["100% accurate", "guarantees 10x faster"],
              sourcesChecked: ["PubMed API", "dbSNP Genome Index", "AICPA Security Directory"],
              rewrite: "Early-stage pilots indicate faster matches by parsing patient records against structured database profiles.",
            });
          }
        }, 300);
      }
    }, stepDuration);
  };

  const steps = activeMode === "startup"
    ? [
        "Ingesting business model concept...",
        "Identifying target industry verticals...",
        "Evaluating TAM and competitive overlaps...",
        "Structuring differentiators & moat metrics...",
        "Compiling analysis report summary...",
      ]
    : [
        "Tokenizing pitch statement input...",
        "Scanning for absolute guarantees or buzzwords...",
        "Querying registered research indices...",
        "Calculating confidence percentage...",
        "Drafting evidence-backed copy rewrite...",
      ];

  return (
    <section id="playground" className="mx-auto max-w-5xl px-6 py-20 relative">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-semibold text-primary font-mono tracking-widest uppercase">Live Playground</span>
        <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
          Try ProofPilot in 10 seconds.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Input your business concept or pitch deck statement to watch the AI evidence engine analyze, verify, and polish your narrative.
        </p>
      </div>

      <div className="glass rounded-[2rem] p-6 border-border/40 relative">
        <div className="absolute inset-0 pointer-events-none animate-shimmer opacity-40" />

        {/* Navigation Toggles */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-border/20 pb-4 mb-6">
          <div className="flex rounded-full border border-border/50 bg-background/50 p-1 text-xs font-semibold self-start">
            <button
              onClick={() => setActiveMode("startup")}
              className={`relative rounded-full px-4 py-2 transition-colors ${
                activeMode === "startup" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeMode === "startup" && (
                <motion.span
                  layoutId="playTabBg"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">Analyze Startup Idea</span>
            </button>
            <button
              onClick={() => setActiveMode("claim")}
              className={`relative rounded-full px-4 py-2 transition-colors ${
                activeMode === "claim" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeMode === "claim" && (
                <motion.span
                  layoutId="playTabBg"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">Audit Claims</span>
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setInputText(activeMode === "startup" ? startupPlaceholder : claimPlaceholder);
              }}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              disabled={isAnalyzing}
            >
              Load Example
            </Button>
          </div>
        </div>

        {/* Input Interface */}
        {!isAnalyzing && !completed && (
          <div className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={activeMode === "startup" ? startupPlaceholder : claimPlaceholder}
              className="w-full min-h-[120px] bg-background/50 border border-border/40 rounded-2xl p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/45 resize-none leading-relaxed"
            />
            <div className="flex justify-end">
              <Button onClick={runAnalysis} className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 flex items-center gap-2">
                Analyze Narrative <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Loading / Execution Phase */}
        {isAnalyzing && (
          <div className="py-8 flex flex-col items-center justify-center min-h-[220px]">
            <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground tracking-tight">ProofPilot Inference Active</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span>{steps[Math.min(analysisStep, steps.length - 1)]}</span>
              </div>
            </div>

            {/* Staggered mini progress dots */}
            <div className="flex gap-1.5 mt-8">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                    i <= analysisStep ? "bg-primary" : "bg-border/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completion Panel */}
        {completed && results && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {activeMode === "startup" ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-background/20 border border-border/30 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Health Score</span>
                    <h4 className="text-3xl font-bold tracking-tight text-emerald-500 mt-1">{results.score}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal mt-4">Strong concept signal. Addresses identified market gap.</p>
                </div>
                <div className="bg-background/20 border border-border/30 rounded-2xl p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Market Opportunity</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{results.market}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Competition</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{results.competition}</p>
                  </div>
                </div>
                <div className="bg-background/20 border border-border/30 rounded-2xl p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Moat Rating</span>
                    <p className="text-sm font-bold text-primary mt-0.5">{results.moat}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Execution Risk</span>
                    <p className="text-sm font-bold text-amber-500 mt-0.5">{results.risk}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
                <div className="border border-border/30 bg-background/20 rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Document Audit Output</span>
                    <p className="text-xs text-foreground/80 mt-2 font-mono leading-relaxed italic bg-background/40 border border-border/20 rounded-xl p-3">
                      &ldquo;Our platform is <span className="underline decoration-red-500 decoration-wavy decoration-2">100% accurate</span> and <span className="underline decoration-red-500 decoration-wavy decoration-2">guarantees 10x faster</span> recruitment with no dropouts.&rdquo;
                    </p>
                  </div>
                  <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4 border-dashed">
                    <p className="text-[10px] uppercase font-mono text-emerald-500 tracking-wider flex items-center gap-1.5">
                      <PenLine className="h-3.5 w-3.5" /> Suggested rewrite
                    </p>
                    <p className="mt-2 text-xs text-emerald-400 leading-relaxed font-semibold italic">
                      &ldquo;{results.rewrite}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="border border-border/30 bg-background/20 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border/10 pb-2">
                      <span className="text-xs text-muted-foreground font-medium">Claims Flagged</span>
                      <span className="text-xs font-bold text-[hsl(var(--risk))]">{results.violations} Unsupported</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/10 pb-2">
                      <span className="text-xs text-muted-foreground font-medium">Confidence Score</span>
                      <span className="text-xs font-bold text-[hsl(var(--warn))]">{results.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">Sources Queried</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {results.sourcesChecked.map((src: string) => (
                          <span key={src} className="text-[9px] font-mono bg-border/40 text-muted-foreground px-2 py-0.5 rounded">
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setCompleted(false)} variant="outline" size="sm" className="w-full mt-4 flex items-center justify-center gap-1.5 text-xs">
                    <RefreshCw className="h-3.5 w-3.5" /> Audit Another Claim
                  </Button>
                </div>
              </div>
            )}

            {activeMode === "startup" && (
              <div className="flex justify-between items-center bg-background/30 border border-border/20 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary uppercase font-mono mr-2">Recommendation:</span>
                  {results.recommendation}
                </p>
                <Button onClick={() => setCompleted(false)} variant="outline" size="sm" className="shrink-0 text-xs">
                  Reset Playground
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Social Proof Strip ---------------- */
function SocialProof() {
  return (
    <section className="border-y border-border/20 bg-background/20 py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col items-center justify-between gap-8 md:flex-row">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
          The AI Evidence Network
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-xs text-muted-foreground/50">
          {/* AMD Logo */}
          <div className="flex items-center gap-2 hover:text-foreground/80 transition-colors duration-300">
            <svg viewBox="0 0 100 24" className="h-4 w-auto fill-current" aria-label="AMD">
              <path d="M12 2L2 12h6v10h8V12h6L12 2zM32 4h4.5l4.5 12h-3.2l-1.1-3.2h-3.4L32.2 16H29L32 4zm1.5 6.2h2.2l-1.1-3.1-1.1 3.1zM48 4h3.5l3.5 8 3.5-8H62v12h-2.5V7.5L56 14h-1.5l-3.5-6.5V16H48V4zm22 0h5c2.2 0 3.8 1.4 3.8 3.5s-1.6 3.5-3.8 3.5H72.5V16H70V4zm2.5 4.8h2.5c1 0 1.5-.5 1.5-1.2 0-.8-.5-1.1-1.5-1.1h-2.5v2.3z" />
            </svg>
          </div>

          {/* ROCm Logo */}
          <div className="flex items-center gap-1.5 hover:text-foreground/80 transition-colors duration-300">
            <Cpu className="h-4 w-4" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">AMD ROCm</span>
          </div>

          {/* OpenAI Logo */}
          <div className="flex items-center gap-2 hover:text-foreground/80 transition-colors duration-300">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-label="OpenAI">
              <path d="M22.28 10.6a5.79 5.79 0 0 0-.25-2A5.86 5.86 0 0 0 18.2 4.8a5.8 5.8 0 0 0-5-1.7 5.86 5.86 0 0 0-4.3 2.92 5.83 5.83 0 0 0-2.8 1.1 5.88 5.88 0 0 0-1.7 5.2A5.79 5.79 0 0 0 4.6 14.3a5.86 5.86 0 0 0 3.8 3.8 5.8 5.8 0 0 0 5 1.7 5.86 5.86 0 0 0 4.3-2.92 5.83 5.83 0 0 0 2.8-1.1 5.88 5.88 0 0 0 1.78-5.18zm-11 7.2a4 4 0 0 1-1.87-.47l3.22-1.86a.8.8 0 0 0 .4-.69v-4.52l1.41.81a.06.06 0 0 1 .03.05v3.68a4 4 0 0 1-3.19 3.01zM6.1 14.7a4 4 0 0 1 .28-1.9l3.22 1.86a.8.8 0 0 0 .8 0l3.92-2.26v1.62a.06.06 0 0 1-.03.05l-3.19 1.84a4 4 0 0 1-5-1.21zm.28-5.4a4 4 0 0 1 1.59-1.43l1.41.81a.8.8 0 0 0 .4.69v4.52l-3.22-1.86a.06.06 0 0 1-.03-.05v-2.68zm9.5 4.5l-3.92 2.26a.8.8 0 0 0-.4.69v4.52a4 4 0 0 1-4.87-1.42 4 4 0 0 1-.28-1.9l3.22-1.86a.8.8 0 0 0 .8 0l3.92-2.26v1.62a.06.06 0 0 1-.03.05l-3.19 1.84a4 4 0 0 1-5-1.21z" />
            </svg>
            <span className="font-semibold text-xs tracking-tight">OpenAI Compatible</span>
          </div>

          {/* Vercel Logo */}
          <div className="flex items-center gap-1.5 hover:text-foreground/80 transition-colors duration-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-auto fill-current" aria-label="Vercel">
              <path d="M24 22.5H0L12 1.5L24 22.5Z" />
            </svg>
            <span className="font-semibold text-xs tracking-tight">Vercel</span>
          </div>

          {/* Fireworks AI */}
          <div className="flex items-center gap-1.5 hover:text-foreground/80 transition-colors duration-300">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-xs tracking-tight">Fireworks AI</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Startup Intelligence (AI Operating System) ---------------- */
function StartupOS() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>("ProofPilot");
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const competitors = [
    { name: "Legacy Databases", gap: 30, defensibility: 25, weakness: "Static data pulls, no claim correlation", speed: "Minutes", moat: "None" },
    { name: "Manual Consultants", gap: 65, defensibility: 15, weakness: "Extremely slow, high consulting cost", speed: "Weeks", moat: "Relationships" },
    { name: "Copilot Pitch Writers", gap: 40, defensibility: 45, weakness: "Generative fluff, makes up metrics", speed: "Seconds", moat: "LLM Fine-tuning" },
    { name: "ProofPilot", gap: 85, defensibility: 85, weakness: "Requires detailed user input for max depth", speed: "Instant", moat: "Evidence verification graph" },
  ];

  const metricsData: any = {
    "Market Validation": "Evaluates aggregate TAM size and calculates active pre-seed niche validation indicators.",
    "Moat Defensibility": "Grades unique algorithmic IP, data proprietary lock-ins, and local-first acceleration layers.",
    "Competition Level": "Identifies direct feature overlap against 4 key product segments in Q1 matrix.",
    "Execution Risk": "Evaluates pricing models, operational hurdles, and provides technical compliance recommendations.",
  };

  return (
    <Section
      id="startup-os"
      eyebrow="Startup Intelligence"
      title="Analyze before you build."
      lead="AI audits your business hypothesis before you write code or pitch investors. Strengthen differentiation, map competition, and evaluate ICP alignment."
    >
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Side: Graph Dashboard */}
        <div className="glass rounded-[2rem] p-6 border-border/40 relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Interactive Matrix</span>
                <h3 className="text-xl font-bold tracking-tight mt-0.5">Competitor Positioning</h3>
              </div>
              <span className="text-xs bg-primary/10 border border-primary/20 text-primary font-mono rounded-full px-2.5 py-1">
                Quadrant 1 Focus
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Hover over points on the coordinate map below to inspect product profiles and compare relative defensibility.
            </p>
          </div>

          {/* Quadrant Plot */}
          <div className="relative h-64 border border-border/30 rounded-xl bg-background/50 flex items-center justify-center overflow-hidden">
            {/* Grid quadrants shading */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-500/[0.015] border-l border-b border-border/10" />
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500/[0.005] border-r border-b border-border/10" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-500/[0.005] border-r border-t border-border/10" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-500/[0.005] border-l border-t border-border/10" />

            {/* Solid Y-Axis (Left) and X-Axis (Bottom) lines */}
            <div className="absolute left-0 inset-y-0 w-[2px] bg-border/60 z-20" />
            <div className="absolute bottom-0 inset-x-0 h-[2px] bg-border/60 z-20" />

            {/* Axis Tick Marks */}
            {/* Y-Axis Ticks at 25%, 50%, 75% */}
            <div className="absolute left-0 bottom-1/4 w-1.5 h-[1px] bg-border z-20" />
            <div className="absolute left-0 bottom-1/2 w-1.5 h-[1px] bg-border z-20" />
            <div className="absolute left-0 bottom-3/4 w-1.5 h-[1px] bg-border z-20" />
            
            {/* X-Axis Ticks at 25%, 50%, 75% */}
            <div className="absolute bottom-0 left-1/4 w-[1px] h-1.5 bg-border z-20" />
            <div className="absolute bottom-0 left-1/2 w-[1px] h-1.5 bg-border z-20" />
            <div className="absolute bottom-0 left-3/4 w-[1px] h-1.5 bg-border z-20" />

            {/* Centered Quadrant Label Watermarks */}
            <span className="absolute top-1/4 right-1/4 -translate-y-1/2 translate-x-1/2 text-[9px] font-mono font-bold tracking-wider text-emerald-500/20 uppercase select-none pointer-events-none">Optimal Advantage</span>
            <span className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 text-[9px] font-mono font-bold tracking-wider text-blue-400/20 uppercase select-none pointer-events-none">Crowded Moat</span>
            <span className="absolute bottom-1/4 left-1/4 translate-y-1/2 -translate-x-1/2 text-[9px] font-mono font-bold tracking-wider text-muted-foreground/15 uppercase select-none pointer-events-none">Commodity Zone</span>
            <span className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 text-[9px] font-mono font-bold tracking-wider text-amber-500/15 uppercase select-none pointer-events-none">Unprotected Gap</span>

            {/* Axis grid split lines */}
            <div className="absolute inset-x-0 h-[1px] bg-border/20 top-1/2" />
            <div className="absolute inset-y-0 w-[1px] bg-border/20 left-1/2" />

            {/* Axis Direction Indicators */}
            <span className="absolute bottom-2.5 right-4 text-[9px] font-mono font-semibold text-muted-foreground/80 uppercase z-20">High Market Gap →</span>
            <span className="absolute top-2.5 left-4 text-[9px] font-mono font-semibold text-muted-foreground/80 uppercase z-20">↑ High Defensibility</span>

            {/* Projection Lines when hovered */}
            {competitors.map((comp) => {
              const isSelected = selectedCompetitor === comp.name;
              if (!isSelected) return null;
              return (
                <div key={`proj-${comp.name}`} className="absolute inset-0 pointer-events-none">
                  {/* Horizontal projection to left axis */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.25 }}
                    className="absolute h-[1px] bg-primary/30 border-t border-dashed border-primary/45 origin-left"
                    style={{
                      left: 0,
                      width: `${comp.gap}%`,
                      bottom: `${comp.defensibility}%`,
                    }}
                  />
                  {/* Vertical projection to bottom axis */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.25 }}
                    className="absolute w-[1px] bg-primary/30 border-l border-dashed border-primary/45 origin-bottom"
                    style={{
                      left: `${comp.gap}%`,
                      bottom: 0,
                      height: `${comp.defensibility}%`,
                    }}
                  />
                </div>
              );
            })}

            {/* Plot Points */}
            {competitors.map((comp) => {
              return (
                <button
                  key={comp.name}
                  onMouseEnter={() => setSelectedCompetitor(comp.name)}
                  className={`absolute rounded-full flex items-center justify-center transition-all ${
                    comp.name === "ProofPilot"
                      ? "bg-primary text-primary-foreground h-8 w-8 shadow-lg shadow-primary/40 z-10 animate-pulse border-2 border-primary-foreground/20"
                      : "bg-secondary/80 border border-border text-muted-foreground hover:border-primary/50 h-6 w-6 hover:scale-105 hover:bg-card z-10"
                  }`}
                  style={{
                    left: `${comp.gap}%`,
                    bottom: `${comp.defensibility}%`,
                    transform: "translate(-50%, 50%)",
                  }}
                >
                  {comp.name === "ProofPilot" ? (
                    <Logo showWord={false} className="h-4 w-4" />
                  ) : (
                    <span className="text-[10px] font-bold font-mono text-foreground/80">{comp.name.charAt(0)}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Metrics with Hover Explanations */}
          <div className="grid grid-cols-2 gap-3 mt-5 relative">
            {Object.keys(metricsData).map((metric) => (
              <div
                key={metric}
                onMouseEnter={() => setHoveredMetric(metric)}
                onMouseLeave={() => setHoveredMetric(null)}
                className="border border-border/25 bg-background/20 rounded-xl p-3 cursor-pointer hover:border-primary/30 transition-all relative group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-mono">{metric}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {metric === "Market Validation" && "92%"}
                  {metric === "Moat Defensibility" && "78%"}
                  {metric === "Competition Level" && "Low-Med"}
                  {metric === "Execution Risk" && "Minimal"}
                </p>

                {/* Inline Hover Explanation Card */}
                <AnimatePresence>
                  {hoveredMetric === metric && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 bottom-full left-0 right-0 mb-2 p-3 bg-secondary/95 border border-border rounded-xl shadow-xl backdrop-blur"
                    >
                      <p className="text-[10px] font-mono text-primary uppercase font-bold">{metric} Detail</p>
                      <p className="text-xs text-foreground mt-1 leading-relaxed">
                        {metricsData[metric]}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Selected Competitor Details Panel */}
        <div className="flex flex-col justify-between space-y-4">
          <AnimatePresence mode="wait">
            {selectedCompetitor && (
              <motion.div
                key={selectedCompetitor}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="glass border-border/40 rounded-[2rem] p-6 flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-3 mb-4">
                    <h4 className="text-lg font-bold text-foreground">
                      {selectedCompetitor}
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground">Quadrant Profile</span>
                  </div>

                  {(() => {
                    const data = competitors.find((c) => c.name === selectedCompetitor);
                    if (!data) return null;
                    return (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">Competitor Weakness</p>
                          <p className="text-sm font-semibold text-foreground/90 mt-1 leading-relaxed">
                            {data.weakness}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-xs font-mono text-muted-foreground">Verification Speed</p>
                            <p className="text-sm font-semibold text-foreground mt-1">{data.speed}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-muted-foreground">Moat Defensibility</p>
                            <p className="text-sm font-semibold text-primary mt-1">{data.moat}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-8 border-t border-border/20 pt-4 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground leading-snug">
                    Compare profiles to construct defensible moats.
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/analyze-startup" className="flex items-center gap-1">
                      Full Analysis <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border border-border/20 bg-background/25 rounded-2xl p-5 flex items-start gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h5 className="text-xs font-bold text-orange-500 uppercase tracking-wider">Startup Risks</h5>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Pricing model overlap with existing copycat platforms detected. We recommend focusing GTM strategies on integration depth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Workflow (Interactive Scroll timeline) ---------------- */
function WorkflowJourney() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Startup Idea",
      desc: "Submit your raw business model or pitch narrative. Our parser ingests abstract pitches.",
      icon: PenLine,
      details: "Parsing 250 words...",
    },
    {
      title: "AI Analysis",
      desc: "Evaluates market size, TAM, ICP alignment, and structural competitive risks.",
      icon: ScanSearch,
      details: "Mapping 4 dimensions...",
    },
    {
      title: "Competitive Research",
      desc: "Maps positioning coordinates against mapped competitors.",
      icon: Compass,
      details: "Scanning 12 competitor domains...",
    },
    {
      title: "Claim Generation",
      desc: "Deconstructs and tags every statement in your copy.",
      icon: ListChecks,
      details: "6 claim profiles found...",
    },
    {
      title: "Evidence Verification",
      desc: "Cross-references claims against academic databases and clinical registers.",
      icon: Search,
      details: "Querying PubMed & dbSNP APIs...",
    },
    {
      title: "Investor Report",
      desc: "Compiles a clean, verifiable PDF report.",
      icon: FileCheck2,
      details: "PDF packing complete.",
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(steps.length - 1, Math.floor(latest * steps.length * 1.2));
    setActiveStep(Math.max(0, idx));
  });

  return (
    <section id="workflow" ref={containerRef} className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        {/* Left column: Narrative Timeline */}
        <div>
          <span className="text-sm font-semibold text-primary font-mono tracking-widest uppercase">One Workflow</span>
          <h2 className="mt-3 text-balance text-4xl font-bold leading-tight tracking-tight text-gradient sm:text-5xl">
            From raw idea to investor evidence.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            ProofPilot connects validation and audits into a unified pipeline. Observe how the data matures at each milestone.
          </p>

          <div className="mt-12 relative border-l border-border/40 pl-6 space-y-10">
            <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-border/20" />
            <div
              className="absolute top-0 left-0 w-[1.5px] bg-primary transition-all duration-300"
              style={{
                height: `${((activeStep + 1) / steps.length) * 100}%`,
              }}
            />

            {steps.map((s, i) => {
              const isActive = i === activeStep;
              return (
                <div key={s.title} className="relative group">
                  <span
                    className={`absolute -left-[31px] top-1.5 grid h-4 w-4 place-items-center rounded-full border bg-[#020408] transition-all duration-300 ${
                      isActive ? "border-primary text-primary scale-125" : "border-border text-muted-foreground/40"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary" : "bg-transparent"}`} />
                  </span>

                  <div>
                    <h3
                      className={`text-lg font-semibold tracking-tight transition-colors duration-300 ${
                        isActive ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {s.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-relaxed transition-colors duration-300 ${
                        isActive ? "text-muted-foreground" : "text-muted-foreground/35"
                      }`}
                    >
                      {s.desc}
                    </p>
                    {isActive && (
                      <span className="inline-block mt-2 text-[10px] font-mono text-primary font-semibold uppercase">
                        {s.details}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Sticky Simulator */}
        <div className="sticky top-24 self-start">
          <div className="glow-radial pointer-events-none absolute -inset-10 -z-10 opacity-30 blur-2xl" />
          <div className="glass border-border/40 rounded-[2rem] p-6 shadow-2xl min-h-[360px] flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-border/20 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  {(() => {
                    const ActiveIcon = steps[activeStep].icon;
                    return <ActiveIcon className="h-4 w-4" />;
                  })()}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  Step {activeStep + 1} Simulation
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">State: Active</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-border/30 bg-background/40 p-5 min-h-[220px] flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none animate-shimmer" />

                  {activeStep === 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">narrative_input.md</p>
                      <p className="text-xs italic leading-relaxed text-foreground/80 font-serif">
                        &ldquo;We are constructing a digital health validation assistant. It reads clinical statements, checks databases automatically, and identifies validation gaps.&rdquo;
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-mono mt-4">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span>Ready for validation processing</span>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase font-semibold">scoring_matrix.json</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/50 border border-border/20 rounded-lg p-3">
                          <p className="text-[10px] text-muted-foreground">Market Size</p>
                          <p className="text-base font-bold text-foreground mt-0.5">$4.2B TAM</p>
                        </div>
                        <div className="bg-background/50 border border-border/20 rounded-lg p-3">
                          <p className="text-[10px] text-muted-foreground">Execution Risk</p>
                          <p className="text-base font-bold text-amber-500 mt-0.5">Low-Med</p>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1 }} />
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="flex flex-col items-center justify-center py-4 relative">
                      <div className="relative h-28 w-28 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_45%,hsl(var(--primary)/0.25)_100%)] animate-radar" />
                        <span className="h-4 w-4 bg-primary rounded-full z-10 shadow-lg shadow-primary/30" />
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground mt-3 uppercase tracking-wider">Mapping relative gaps</p>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">claims_extracted.csv</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs py-1 border-b border-border/10">
                          <span className="text-foreground/80 font-mono">Claim 01: &ldquo;preparation time by 80%&rdquo;</span>
                          <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 rounded px-1.5 py-0.5 uppercase font-mono">Audit</span>
                        </div>
                        <div className="flex justify-between items-center text-xs py-1 border-b border-border/10">
                          <span className="text-foreground/80 font-mono">Claim 02: &ldquo;loved by hundreds of founders&rdquo;</span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded px-1.5 py-0.5 uppercase font-mono">Audit</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 4 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">search_log.txt</p>
                      <div className="font-mono text-[10px] text-muted-foreground space-y-1 leading-snug">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500">[OK]</span> Querying ClinicalTrials.gov API...
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500">[OK]</span> Fetching PubMed records...
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-red-400">[GAP]</span> No evidence for &ldquo;prep time reduction&rdquo;.
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 5 && (
                    <div className="space-y-3 flex flex-col justify-between h-full">
                      <div>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">output_archive.zip</p>
                        <h4 className="text-sm font-semibold mt-1">ProofPilot Evidence Pack</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Verified certificates, competitor scatter plots, and audit reports.</p>
                      </div>
                      <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 mt-2">
                        <Link href="/app/demo" className="flex items-center justify-center gap-1.5">
                          <FileCheck2 className="h-4 w-4" /> Download evidence PDF
                        </Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Claim Audit Section (Hover Highlights) ---------------- */
const AUDIT_ITEMS = [
  {
    text: "loved by hundreds of founders",
    type: "buzzword",
    label: "Vague Buzzword",
    color: "hsl(var(--warn))",
    reason: "Assertion with no supporting data source or registration link.",
    citations: ["Founder Registry Search (0 hits)", "TAM Analytics Index (no verified references)"],
    confidence: 28,
    rewrite: "Early pilot trials incorporate user cohorts from three seed accelerators.",
  },
  {
    text: "reduces pitch preparation time by 80%",
    type: "unsupported",
    label: "Unsupported Metric",
    color: "hsl(var(--risk))",
    reason: "Precise performance claim with zero reference sample size or historical benchmarks.",
    citations: ["Double-blind pitch time logs (0 hits)", "Startup Prep Study Index (no references found)"],
    confidence: 12,
    rewrite: "Founders prepared pitch drafts noticeably faster in structured test groups.",
  },
  {
    text: "guarantees investor funding",
    type: "guarantee",
    label: "Absolute Guarantee",
    color: "hsl(var(--risk))",
    reason: "Unrealistic outcome guarantee that ignores regulatory and financial volatility.",
    citations: ["SEC capital regulations index (unsupported outcome)", "Venture Capital compliance records (no guarantee path)"],
    confidence: 5,
    rewrite: "Engineered to elevate pitch credibility to match standard pre-seed checkpoints.",
  },
  {
    text: "completed our SOC 2 audit in March 2025",
    type: "proven",
    label: "Proven Evidence",
    color: "hsl(var(--proven))",
    reason: "Verifiable, dated event which represents compliant infrastructure.",
    citations: ["AICPA Compliance Registry (1 entry verified)", "Vercel Security Trust Logs (Active Status)"],
    confidence: 96,
    rewrite: "Already validated. Anchor this in the trust section of the pitch.",
  },
  {
    text: "will dominate the market by 2026",
    type: "projection",
    label: "Future Projection",
    color: "hsl(var(--future))",
    reason: "Hyperbolic market forecast with no mapped validation timeline.",
    citations: ["CAGR Growth model forecast (unvalidated)", "Addressable market trajectory logs (0 indicators)"],
    confidence: 22,
    rewrite: "Aiming to capture seed shares inside targeted digital health communities.",
  },
];

function InteractiveClaimAudit() {
  const [activeIdx, setActiveIdx] = useState(1);
  const activeItem = AUDIT_ITEMS[activeIdx];

  return (
    <Section
      id="claim-audit"
      eyebrow="Claim Audit"
      title="Then prove every claim you make."
      lead="ProofPilot audits your slide deck copy — deconstructing assertions, evaluating source relevance, and proposing credible, factual alternatives."
    >
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left Side: Interactive Document Reader */}
        <div className="glass rounded-[2rem] p-6 border-border/40 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-center border-b border-border/20 pb-4 mb-4">
              <h3 className="text-lg font-bold text-foreground">Interactive Reader Board</h3>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Hover highlights below</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hover over the highlighted segments in the pitch deck draft to view immediate risk metrics and evidentiary support.
            </p>
          </div>

          <div className="border border-border/20 bg-background/50 rounded-xl p-5 mt-6 font-serif text-sm leading-8 text-foreground/95 italic">
            &ldquo;ProofPilot is{" "}
            <span
              onMouseEnter={() => setActiveIdx(0)}
              className="highlight-buzzword cursor-pointer font-sans not-italic font-medium"
            >
              loved by hundreds of founders
            </span>
            . We{" "}
            <span
              onMouseEnter={() => setActiveIdx(1)}
              className="highlight-unsupported cursor-pointer font-sans not-italic font-medium"
            >
              reduces pitch preparation time by 80%
            </span>{" "}
            and{" "}
            <span
              onMouseEnter={() => setActiveIdx(2)}
              className="highlight-unsupported cursor-pointer font-sans not-italic font-medium"
            >
              guarantees investor funding
            </span>{" "}
            on the first presentation. Our team{" "}
            <span
              onMouseEnter={() => setActiveIdx(3)}
              className="highlight-proven cursor-pointer font-sans not-italic font-medium"
            >
              completed our SOC 2 audit in March 2025
            </span>{" "}
            and we{" "}
            <span
              onMouseEnter={() => setActiveIdx(4)}
              className="highlight-projection cursor-pointer font-sans not-italic font-medium"
            >
              will dominate the market by 2026
            </span>
            .&rdquo;
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--risk))]" /> Red: Critical Gap</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--warn))]" /> Orange: Subjective</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--future))]" /> Blue: Projection</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--proven))]" /> Green: Verifiable</span>
          </div>
        </div>

        {/* Right Side: Diagnosis Panel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="glass border-border/40 rounded-[2rem] p-6 shadow-xl flex flex-col justify-between h-full min-h-[380px]"
            >
              <div>
                <div className="flex justify-between items-center border-b border-border/20 pb-3 mb-4">
                  <span
                    className="text-xs font-bold font-mono rounded px-2 py-0.5 border"
                    style={{
                      borderColor: activeItem.color,
                      color: activeItem.color,
                      backgroundColor: `${activeItem.color}15`,
                    }}
                  >
                    {activeItem.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Credibility</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: activeItem.color }}>
                      {activeItem.confidence}%
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-foreground/75">&ldquo;{activeItem.text}&rdquo;</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">{activeItem.reason}</p>

                <div className="mt-4 bg-background/30 rounded-lg p-3 border border-border/10">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Evidence search log</p>
                  
                  {/* Citations Appear One-by-One */}
                  <div className="mt-2 space-y-1.5">
                    {activeItem.citations.map((cite, idx) => (
                      <motion.div
                        key={cite}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.25, duration: 0.3 }}
                        className="text-[11px] font-mono text-foreground/80 flex items-start gap-1.5"
                      >
                        <span className="text-primary/70">→</span>
                        <span>{cite}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border/20 pt-4">
                <p className="text-[10px] font-mono text-emerald-500 uppercase font-bold flex items-center gap-1">
                  <PenLine className="h-3 w-3" /> Suggested Rewrite
                </p>
                <p className="text-xs text-emerald-400 mt-1.5 leading-relaxed italic font-semibold">
                  &ldquo;{activeItem.rewrite}&rdquo;
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Evidence Engine (Categories Grid) ---------------- */
function EvidenceEngine() {
  const categories = [
    { icon: BadgeCheck, t: "Factual Claims", d: "Concrete items requiring independent validation databases." },
    { icon: Gauge, t: "Performance Claims", d: "Speed, TAM metrics requiring controlled pilot studies." },
    { icon: Building2, t: "Market Claims", d: "Target addressable segments requiring registered reports." },
    { icon: Users, t: "Adoption Claims", d: "Founder numbers, user reviews requiring verifiable records." },
    { icon: Wrench, t: "Technical Claims", d: "Algorithm features requiring clear open-source specifications." },
    { icon: GitCompare, t: "Comparative Claims", d: "Competitor comparisons requiring objective feature maps." },
    { icon: ShieldAlert, t: "Outcome Guarantees", d: "Financial outcomes requiring absolute hazard disclosures." },
    { icon: Clock, t: "Projections", d: "Future performance requiring detailed milestone roadmaps." },
    { icon: Sparkles, t: "Vague Buzzwords", d: "Aesthetic marketing copy requiring specific proof points." },
  ];

  return (
    <Section
      eyebrow="Evidence Engine"
      title="The nine ways a claim goes wrong."
      lead="ProofPilot is built to systematically identify, score, and remediate structural gaps in startup communication."
    >
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <motion.div
            key={c.t}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: (i % 3) * 0.05 }}
            className="group glass rounded-2xl p-5 border-border/40 hover:border-primary/45 transition-colors duration-300 flex items-start gap-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 group-hover:scale-105">
              <c.icon className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-[15px] font-semibold text-foreground tracking-tight">{c.t}</h4>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">{c.d}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Results ---------------- */
function Results() {
  return (
    <Section
      eyebrow="Proven Results"
      title="Same ambition. Credible language."
      lead="Eliminate hype. Let verified evidence speak for your technology. Compare standard pitch statements to validated copy."
    >
      <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 border-b border-border/20 pb-12">
        {[
          { to: 8, suffix: "", t: "Key business dimensions analyzed" },
          { to: 9, suffix: "", t: "Claim categories parsed" },
          { to: 85, suffix: "%", t: "Fewer marketing red flags" },
          { to: 100, suffix: "%", t: "Private guest browser mode" },
        ].map((m, i) => (
          <motion.div key={m.t} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}>
            <p className="text-4xl font-bold tracking-tight text-gradient-primary sm:text-5xl">
              <Counter to={m.to} suffix={m.suffix} />
            </p>
            <p className="mt-2.5 text-xs text-muted-foreground leading-normal">{m.t}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <motion.div
          {...fadeUp}
          className="rounded-2xl border border-[hsl(var(--risk)/0.3)] bg-[hsl(var(--risk)/0.03)] p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-[hsl(var(--risk))] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl">
            BEFORE AUDIT
          </div>
          <span className="text-xs font-mono text-[hsl(var(--risk))] uppercase font-bold">Ambitious Draft</span>
          <p className="mt-3.5 text-sm leading-7 text-foreground/80 italic">
            &ldquo;Our software reduces pitch preparation time by 80%, improves investor conversion by 3x, and guarantees investor funding on the very first meeting.&rdquo;
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="rounded-2xl border border-[hsl(var(--proven)/0.3)] bg-[hsl(var(--proven)/0.03)] p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-[hsl(var(--proven))] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl">
            AFTER AUDIT
          </div>
          <span className="text-xs font-mono text-[hsl(var(--proven))] uppercase font-bold">Credible Truth</span>
          <p className="mt-3.5 text-sm leading-7 text-foreground/80 italic font-medium">
            &ldquo;In pilot test groups, founders prepare pitches noticeably faster, leveraging automated checklists to clear standard investor due diligence checkpoints.&rdquo;
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.5, ease: EASE, onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(val)}
      {suffix}
    </span>
  );
}

/* ---------------- Architecture & Pipeline ---------------- */
function ArchitecturePipeline() {
  const nodes = [
    { id: "upload", label: "Upload", icon: FileText, desc: "Slide / text deck input" },
    { id: "parsing", label: "AI Parsing", icon: Cpu, desc: "Context mapping & tokenization" },
    { id: "classification", label: "Classification", icon: ListChecks, desc: "Extracting claims & assertions" },
    { id: "search", label: "Evidence Search", icon: Search, desc: "PubMed, dbSNP validation check" },
    { id: "reasoning", label: "Reasoning", icon: Compass, desc: "Compare evidence logic" },
    { id: "rewrite", label: "Rewrite Engine", icon: PenLine, desc: "Structure facts & polish language" },
    { id: "report", label: "Evidence Pack", icon: BadgeCheck, desc: "Export report archive" },
  ];

  return (
    <Section
      id="architecture"
      eyebrow="Architecture & Infrastructure"
      title="One pipeline. AMD under the hood."
      lead="Both Startup Analysis and Claim Audit route inference workloads to AMD GPU-backed, ROCm-compatible infrastructure. Experience verified data streaming through a custom local-first adapter."
    >
      <div className="mt-12 glass rounded-[2.5rem] p-8 border-border/40 relative overflow-hidden">
        {/* Animated flow SVG paths */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <svg className="h-full w-full" fill="none">
            <path
              d="M 120 110 L 960 110"
              stroke="hsl(var(--primary)/0.2)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle r="4" fill="hsl(var(--primary))">
              <animateMotion
                path="M 120 110 L 960 110"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="4" fill="hsl(var(--proven))">
              <animateMotion
                path="M 120 110 L 960 110"
                dur="4s"
                begin="1.3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="4" fill="hsl(var(--future))">
              <animateMotion
                path="M 120 110 L 960 110"
                dur="4s"
                begin="2.6s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>

        <div className="grid gap-6 md:grid-cols-7 relative z-10">
          {nodes.map((node, idx) => (
            <div key={node.id} className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl border border-border/40 bg-[#020408] flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-lg relative group">
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-background text-[9px] font-mono border border-border flex items-center justify-center rounded-full text-muted-foreground/70">
                  {idx + 1}
                </span>
                <node.icon className="h-6 w-6" />
              </div>
              <h4 className="text-xs font-semibold mt-3 text-foreground">{node.label}</h4>
              <p className="text-[10px] text-muted-foreground/75 mt-1 leading-relaxed hidden md:block">
                {node.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 border-t border-border/20 pt-8 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-2">
              {["Provider Abstraction", "OpenAI-compatible", "ROCm-ready", "Local Guest Mode"].map((b) => (
                <span key={b} className="rounded-full border border-border/50 bg-background/50 px-2.5 py-1 text-[10px] font-mono text-muted-foreground">
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              ProofPilot routes local computation paths using the AMD ROCm ecosystem. The platform abstracts inference providers, enabling swift local guest computations with Zero-Knowledge storage.
            </p>
          </div>

          <div className="bg-background/40 border border-border/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Cpu className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">AMD Inference Active</p>
                <p className="text-[10px] text-muted-foreground">ROCm core translation active</p>
              </div>
            </div>
            <div className="font-mono text-[9px] text-muted-foreground bg-[#020408] border border-border px-2.5 py-1 rounded">
              AI_PROVIDER=amd_rocm
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCTA() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28 text-center relative">
      <div className="glow-radial pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 opacity-20 blur-3xl" />
      
      <motion.blockquote {...fadeUp} className="text-2xl font-medium leading-relaxed tracking-tight text-foreground sm:text-3xl italic">
        &ldquo;Evidence beats assertion.&rdquo;
      </motion.blockquote>
      <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="mt-3 text-xs font-mono uppercase tracking-wider text-primary/80">
        ProofPilot System Credo
      </motion.p>

      <div className="hairline mx-auto my-14 max-w-sm opacity-60" />

      <motion.h2 {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="text-balance text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
        Turn vision into investor-ready business.
      </motion.h2>
      <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Audit the narrative, find target databases, check formatting guidelines, and produce proof points that stand up to diligence checks.
      </motion.p>

      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="mt-10 grid gap-4 sm:mx-auto sm:max-w-xl sm:grid-cols-2">
        <MagneticButton className="relative rounded-2xl border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-all cursor-pointer group">
          <Link href="/analyze-startup" className="flex items-center justify-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Analyze Startup</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
          </Link>
        </MagneticButton>

        <MagneticButton className="relative rounded-2xl border border-border bg-card/20 p-4 hover:bg-card/35 transition-all cursor-pointer group">
          <Link href="/app/new" className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-semibold text-foreground">Audit Claims</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
          </Link>
        </MagneticButton>
      </motion.div>

      <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.28 }} className="mt-6">
        <Link href="/app/demo" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground transition-colors hover:text-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" /> Run a pre-built demo audit session
        </Link>
      </motion.p>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-4">
            <Logo />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              ProofPilot helps founders validate startup mechanics and prove statements before pitching. Backed by AMD ROCm local-first acceleration.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono bg-border/40 text-muted-foreground px-2.5 py-0.5 rounded">
                v1.2.4-stable
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-mono text-muted-foreground/80 uppercase">API Systems Active</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-bold">Product</h4>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li><Link href="/analyze-startup" className="hover:text-foreground transition-colors">Startup OS</Link></li>
              <li><Link href="/app/new" className="hover:text-foreground transition-colors">Claim Audit</Link></li>
              <li><Link href="/app/demo" className="hover:text-foreground transition-colors">Interactive Demo</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Product Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-bold">Developer</h4>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li><a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a></li>
              <li><a href="https://github.com" className="hover:text-foreground transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-bold">Company</h4>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Charter</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service Charter</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[10px] text-muted-foreground font-mono">
            &copy; {new Date().getFullYear()} ProofPilot. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/60 font-mono">AMD Act II Hackathon Submission</span>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Section shell ---------------- */
function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-20 sm:py-28 relative">
      <motion.div {...fadeUp} className="max-w-3xl">
        <span className="text-xs font-semibold text-primary font-mono tracking-widest uppercase">{eyebrow}</span>
        <h2 className="mt-3 text-balance text-4xl font-bold leading-tight tracking-tight text-gradient sm:text-5xl">
          {title}
        </h2>
        {lead && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{lead}</p>}
      </motion.div>
      {children}
    </section>
  );
}
