import type { SourceRecord } from "@/lib/competitors/schema";

export type SearchResult = SourceRecord & { snippet: string };

export interface SearchAdapter {
  readonly id: string;
  readonly configured: boolean;
  /** Retrieve recent public content for a query (recency-biased). */
  search(query: string, opts?: { maxResults?: number }): Promise<SearchResult[]>;
}
