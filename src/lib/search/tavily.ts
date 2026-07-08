import type { SearchAdapter, SearchResult } from "./types";

function publisherFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function classify(url: string): SearchResult["sourceType"] {
  const u = url.toLowerCase();
  if (/pricing/.test(u)) return "pricing_page";
  if (/blog|changelog|news\/|\/updates/.test(u)) return "official_blog";
  if (/careers|jobs|greenhouse|lever\.co|ashbyhq/.test(u)) return "jobs";
  if (/apps\.apple\.com|play\.google\.com/.test(u)) return "app_store";
  if (/techcrunch|reuters|bloomberg|forbes|crunchbase|theverge|businesswire/.test(u))
    return "news";
  return "official_site";
}

/**
 * Tavily search adapter (free tier). Selected via SEARCH_PROVIDER=tavily.
 * https://tavily.com — POST /search with an API key.
 */
export function createTavilyAdapter(): SearchAdapter {
  const apiKey = process.env.TAVILY_API_KEY ?? "";
  return {
    id: "tavily",
    configured: Boolean(apiKey),
    async search(query, opts) {
      if (!apiKey) return [];
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: opts?.maxResults ?? 5,
          search_depth: "basic",
          topic: "general",
          days: 730, // ~24 months recency window
        }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const results: Array<{
        title?: string;
        url?: string;
        content?: string;
        published_date?: string;
      }> = data?.results ?? [];
      const retrievedAt = new Date().toISOString();
      return results
        .filter((r) => r.url)
        .map((r) => ({
          title: r.title || r.url!,
          url: r.url!,
          publisher: publisherFromUrl(r.url!),
          publishedAt: r.published_date,
          retrievedAt,
          sourceType: classify(r.url!),
          snippet: (r.content || "").slice(0, 600),
        }));
    },
  };
}
