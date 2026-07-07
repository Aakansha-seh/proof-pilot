"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  TrendingUp,
  Building2,
  Users,
  Wrench,
  GitCompare,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClaimMapPreview } from "@/components/landing/claim-map-preview";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 aurora" />
        <div className="absolute inset-x-0 top-0 h-[600px] bg-grid" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#categories" className="hover:text-foreground">Claim types</a>
          <a href="#amd" className="hover:text-foreground">Architecture</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/demo">View demo</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/app/new">Audit my claims</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-2 lg:pt-24">
        <div>
          <motion.div {...fadeUp}>
            <Badge variant="neutral" className="mb-5 gap-1.5 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              The Evidence Layer for founders & builders
            </Badge>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-gradient sm:text-5xl lg:text-6xl"
          >
            Turn ambitious claims into credible proof.
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            ProofPilot audits startup pitches, project reports, and hackathon
            submissions—showing what is supported, what is risky, and what to
            validate next.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="/app/new">
                Audit My Claims <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/app/demo">View Demo Audit</Link>
            </Button>
          </motion.div>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.24 }}
            className="mt-5 text-xs text-muted-foreground"
          >
            No signup. Runs in Guest Mode. Saved on your device.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
          <ClaimMapPreview />
        </motion.div>
      </section>

      {/* How it works */}
      <Section id="how" eyebrow="How it works" title="From claim to credible proof in one pass">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: ScanSearch, t: "Claim extraction", d: "Pull every factual, performance, and market claim." },
            { icon: ShieldAlert, t: "Evidence-gap analysis", d: "Flag what's unsupported or risky." },
            { icon: ListChecks, t: "Validation plan", d: "A concrete test for each weak claim." },
            { icon: PenLine, t: "Credible rewrite", d: "Keep the ambition, drop the overreach." },
            { icon: FileCheck2, t: "Evidence Pack", d: "A polished report for judges & mentors." },
            { icon: Gauge, t: "Credibility score", d: "One number to track your progress." },
          ].map((s, i) => (
            <motion.div
              key={s.t}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card/50 p-4"
            >
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Claim categories */}
      <Section id="categories" eyebrow="Claim categories" title="ProofPilot knows the nine ways a claim goes wrong">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BadgeCheck, t: "Factual", d: "Statements presented as objective truth." },
            { icon: Gauge, t: "Performance", d: "Speed, accuracy, and efficiency numbers." },
            { icon: Building2, t: "Market", d: "TAM, demand, and opportunity size." },
            { icon: Users, t: "User adoption", d: "Traction, retention, and endorsements." },
            { icon: Wrench, t: "Technical", d: "How the system works under the hood." },
            { icon: GitCompare, t: "Comparative", d: "\"Better than\" and \"unlike others\"." },
            { icon: ShieldAlert, t: "Guarantee", d: "Absolute promises and warranties." },
            { icon: Clock, t: "Future projection", d: "Forecasts that need a validation path." },
            { icon: Sparkles, t: "Vague marketing", d: "Buzzwords with no measurable meaning." },
          ].map((c, i) => (
            <motion.div
              key={c.t}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (i % 3) * 0.05 }}
              className="flex gap-3 rounded-xl border border-border bg-card/50 p-4"
            >
              <c.icon className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{c.t}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Before / after */}
      <Section eyebrow="Before & after" title="Same ambition. Credible language.">
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div {...fadeUp} className="rounded-2xl border border-[hsl(var(--risk)/0.3)] bg-[hsl(var(--risk)/0.06)] p-6">
            <Badge variant="risk" className="mb-3">Before</Badge>
            <p className="text-sm leading-relaxed text-foreground/90">
              &ldquo;Our system reduces pitch preparation time by 80%, improves
              investor conversion by 3x, and <span className="underline decoration-[hsl(var(--risk))] decoration-2">guarantees</span> that
              every claim is accurate.&rdquo;
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="rounded-2xl border border-[hsl(var(--proven)/0.3)] bg-[hsl(var(--proven)/0.06)] p-6">
            <Badge variant="proven" className="mb-3">After</Badge>
            <p className="text-sm leading-relaxed text-foreground/90">
              &ldquo;In early testing, ProofPilot is designed to cut the time
              founders spend structuring a pitch and flags risky or unsupported
              language before it reaches investors.&rdquo;
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Why evidence matters */}
      <Section eyebrow="Why evidence matters" title="Credibility is the difference between a yes and a pass">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "1st", t: "Investors probe claims", d: "The fastest way to lose a room is a number you can't defend. ProofPilot finds them first." },
            { n: "80%", t: "of red flags are language", d: "Guarantees and absolutes signal risk. Small rewrites remove that risk without losing ambition." },
            { n: "7 days", t: "to your first proof", d: "Every audit ships with a validation plan so you know exactly what to test next week." },
          ].map((s, i) => (
            <motion.div key={s.t} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="rounded-2xl border border-border bg-card/50 p-6">
              <p className="text-3xl font-semibold tracking-tight text-gradient">{s.n}</p>
              <p className="mt-2 text-sm font-medium">{s.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* AMD architecture */}
      <Section id="amd" eyebrow="AMD-powered architecture" title="Built to run its core inference on AMD compute">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <p className="text-muted-foreground leading-relaxed">
              ProofPilot&rsquo;s central claim-analysis workload runs through a
              provider abstraction with an AMD-compatible, OpenAI-style inference
              adapter. NVIDIA APIs power rapid development; Fireworks is used
              selectively for final quality; and the AMD adapter routes the core
              evidence pipeline to AMD GPU-backed, ROCm-compatible infrastructure.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="neutral">Provider abstraction</Badge>
              <Badge variant="neutral">OpenAI-compatible</Badge>
              <Badge variant="neutral">ROCm-ready</Badge>
              <Badge variant="neutral">Env-selectable</Badge>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[hsl(0_72%_58%/0.15)] text-[hsl(0_72%_58%)]">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">AMD inference path</p>
                <p className="text-xs text-muted-foreground">Core claim-analysis workload</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 font-mono text-xs">
              {[
                "AI_PROVIDER=amd",
                "AMD_BASE_URL=https://…/v1",
                "AMD_MODEL=llama-3.1-70b-instruct",
              ].map((l) => (
                <div key={l} className="rounded-md border border-border bg-background/60 px-3 py-2 text-muted-foreground">
                  {l}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div {...fadeUp} className="glass relative overflow-hidden rounded-3xl px-8 py-16 text-center">
          <div className="pointer-events-none absolute inset-0 aurora opacity-60" />
          <h2 className="relative text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
            Ready to prove it?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
            Paste a pitch, upload a report, or drop in a slide. ProofPilot shows
            you what to fix before anyone else sees it.
          </p>
          <div className="relative mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/app/new">Audit My Claims <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/app/demo">View Demo Audit</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-xs text-muted-foreground">
            Built for AMD Developer Hackathon ACT II · Track 3: Unicorn
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16">
      <motion.div {...fadeUp} className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </motion.div>
      {children}
    </section>
  );
}
