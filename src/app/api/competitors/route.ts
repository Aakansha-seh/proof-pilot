import { NextRequest, NextResponse } from "next/server";
import { getIntelProvider, activeProviderId } from "@/lib/ai/providers";
import { getSearchAdapter } from "@/lib/search";
import type { SearchResult } from "@/lib/search/types";
import {
  CompetitiveIntelResponseSchema,
  type CompetitiveIntelResponse,
} from "@/lib/competitors/schema";
import type { IntelContext } from "@/lib/competitors/prompts";
import { ProviderError } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_COMPETITORS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea: string = (body.idea || body.originalText || "").toString();
    if (idea.trim().length < 12) {
      return NextResponse.json(
        { error: "Provide the startup idea (or audit text) to research competitors." },
        { status: 400 }
      );
    }

    const knownCompetitors: string[] = Array.isArray(body.knownCompetitors)
      ? body.knownCompetitors.slice(0, MAX_COMPETITORS)
      : [];
    const comparativeClaims: { id?: string; text: string }[] = Array.isArray(
      body.comparativeClaims
    )
      ? body.comparativeClaims.slice(0, 8)
      : [];

    const ctx: IntelContext = {
      idea,
      audience: body.audience,
      problem: body.problem,
      revenueModel: body.revenueModel,
      knownCompetitors,
      comparativeClaims,
    };

    // 1) Gather recent public sources (recency-biased, last ~24 months).
    const search = getSearchAdapter();
    const sources = await gatherSources(search.search.bind(search), ctx);

    // 2) Synthesize — routed to AMD Inference Mode when configured.
    const { provider, usedAmd } = getIntelProvider();
    const started = Date.now();
    const model = await provider.analyzeCompetitors(ctx, sources);
    const analysisDurationMs = Date.now() - started;

    // 3) Attach measured metadata (AMD timing shown only when AMD used).
    const full: CompetitiveIntelResponse = {
      ...model,
      meta: {
        competitorsAnalyzed: model.competitors.length,
        analysisDurationMs,
        usedAmd,
        providerUsed: usedAmd ? "amd" : activeProviderId(),
        searchProvider: search.id,
        sourcesReviewed: sources.length,
        generatedAt: new Date().toISOString(),
      },
    };

    const parsed = CompetitiveIntelResponseSchema.safeParse(full);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Competitive analysis returned an unexpected shape." },
        { status: 502 }
      );
    }
    return NextResponse.json({ intel: parsed.data });
  } catch (e) {
    const message =
      e instanceof ProviderError
        ? e.message
        : "Competitive analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// Build a recency-biased source bundle from user names + idea-derived queries.
async function gatherSources(
  run: (q: string, opts?: { maxResults?: number }) => Promise<SearchResult[]>,
  ctx: IntelContext
): Promise<SearchResult[]> {
  const queries: string[] = [];
  for (const name of ctx.knownCompetitors) {
    queries.push(`${name} product pricing`, `${name} latest news OR changelog`);
  }
  if (ctx.knownCompetitors.length === 0) {
    const seed = ctx.idea.split(/\s+/).slice(0, 12).join(" ");
    queries.push(
      `${seed} competitors`,
      `${seed} alternatives pricing`,
      `${seed} startups 2025`
    );
  }

  const all: SearchResult[] = [];
  const seen = new Set<string>();
  // Cap total queries to keep latency reasonable in the MVP.
  for (const q of queries.slice(0, 8)) {
    let batch: SearchResult[] = [];
    try {
      batch = await run(q, { maxResults: 4 });
    } catch {
      batch = [];
    }
    for (const r of batch) {
      if (seen.has(r.url)) continue;
      seen.add(r.url);
      all.push(r);
    }
  }
  return all.slice(0, 24);
}
