import type { SearchAdapter } from "./types";
import { createTavilyAdapter } from "./tavily";

/** A no-op adapter used when no search provider is configured. */
function createNoneAdapter(): SearchAdapter {
  return { id: "none", configured: false, async search() { return []; } };
}

/**
 * Select the active search/scrape provider via SEARCH_PROVIDER.
 * Supported: tavily | none. Extend here to add SerpAPI, Brave, etc.
 */
export function getSearchAdapter(): SearchAdapter {
  const id = (process.env.SEARCH_PROVIDER || "none").toLowerCase();
  switch (id) {
    case "tavily":
      return createTavilyAdapter();
    default:
      return createNoneAdapter();
  }
}

export type { SearchAdapter, SearchResult } from "./types";
