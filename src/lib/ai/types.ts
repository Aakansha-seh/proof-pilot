import type {
  ClaimAuditResponse,
  ImageAnalysisResponse,
  EvidencePackResponse,
} from "@/lib/schemas";
import type { IntelModelOutput } from "@/lib/competitors/schema";
import type { IntelContext } from "@/lib/competitors/prompts";
import type { SearchResult } from "@/lib/search/types";

export type ProviderId = "nvidia" | "fireworks" | "amd";

export type RewriteTone = "conservative" | "balanced" | "confident";

export interface AIProvider {
  readonly id: ProviderId;
  analyzeClaims(input: string): Promise<ClaimAuditResponse>;
  analyzeImage(
    imageBase64: string,
    mimeType: string
  ): Promise<ImageAnalysisResponse>;
  rewritePitch(input: string, tone: RewriteTone): Promise<string>;
  generateEvidencePack(
    audit: ClaimAuditResponse
  ): Promise<EvidencePackResponse>;
  analyzeCompetitors(
    ctx: IntelContext,
    sources: SearchResult[]
  ): Promise<IntelModelOutput>;
}

export interface ProviderConfig {
  id: ProviderId;
  apiKey: string;
  baseUrl: string;
  model: string;
  visionModel: string;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: ProviderId,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
