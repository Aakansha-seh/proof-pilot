import {
  ClaimAuditResponse,
  ClaimAuditResponseSchema,
  ImageAnalysisResponse,
  ImageAnalysisResponseSchema,
  EvidencePackResponse,
  EvidencePackResponseSchema,
} from "@/lib/schemas";
import {
  AIProvider,
  ProviderConfig,
  ProviderError,
  RewriteTone,
} from "./types";
import {
  CLAIM_AUDIT_SYSTEM,
  claimAuditUser,
  JSON_REPAIR_SYSTEM,
  IMAGE_ANALYSIS_SYSTEM,
  IMAGE_ANALYSIS_USER,
  rewriteSystem,
  EVIDENCE_PACK_SYSTEM,
} from "./prompts";
import { coerceAudit } from "./normalize";
import {
  IntelModelOutput,
  IntelModelOutputSchema,
} from "@/lib/competitors/schema";
import { INTEL_SYSTEM, intelUser, type IntelContext } from "@/lib/competitors/prompts";
import type { SearchResult } from "@/lib/search/types";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

export class OpenAICompatibleProvider implements AIProvider {
  readonly id;
  constructor(private readonly cfg: ProviderConfig) {
    this.id = cfg.id;
  }

  private async chat(
    messages: ChatMessage[],
    opts: { model?: string; temperature?: number; jsonMode?: boolean; maxTokens?: number } = {}
  ): Promise<string> {
    if (!this.cfg.apiKey) {
      throw new ProviderError(
        `Missing API key for provider "${this.id}". Set the matching *_API_KEY in .env.local.`,
        this.id
      );
    }
    const body: Record<string, unknown> = {
      model: opts.model ?? this.cfg.model,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 4096,
    };
    if (opts.jsonMode) body.response_format = { type: "json_object" };

    let res: Response;
    try {
      res = await fetch(`${this.cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.cfg.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new ProviderError(`Network error contacting ${this.id}.`, this.id, e);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ProviderError(
        `${this.id} returned ${res.status}: ${text.slice(0, 400)}`,
        this.id
      );
    }
    const data = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new ProviderError(`${this.id} returned an empty response.`, this.id);
    }
    return content;
  }

  private extractJson(raw: string): string {
    let s = raw.trim();
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) s = fence[1].trim();
    const first = s.indexOf("{");
    const last = s.lastIndexOf("}");
    if (first !== -1 && last !== -1) s = s.slice(first, last + 1);
    return s;
  }

  private async parseWithRepair<T>(
    raw: string,
    schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
    label: string
  ): Promise<T> {
    const attempt = (text: string) => {
      try {
        return schema.safeParse(JSON.parse(this.extractJson(text)));
      } catch {
        return { success: false as const };
      }
    };
    const first = attempt(raw);
    if (first.success && first.data) return first.data;

    const repaired = await this.chat(
      [
        { role: "system", content: JSON_REPAIR_SYSTEM },
        {
          role: "user",
          content: `Fix this into valid JSON for a ${label}. Return only JSON:\n\n${raw}`,
        },
      ],
      { jsonMode: true, temperature: 0 }
    );
    const second = attempt(repaired);
    if (second.success && second.data) return second.data;

    throw new ProviderError(
      `${this.id} produced malformed JSON for ${label}.`,
      this.id
    );
  }

  async analyzeClaims(input: string): Promise<ClaimAuditResponse> {
    const raw = await this.chat(
      [
        { role: "system", content: CLAIM_AUDIT_SYSTEM },
        { role: "user", content: claimAuditUser(input) },
      ],
      { jsonMode: true, maxTokens: 8000 }
    );

    // Tolerant parse: coerce arbitrary model JSON into a valid audit instead
    // of rejecting on minor schema drift. Only re-ask if JSON itself is broken.
    let obj: unknown;
    try {
      obj = JSON.parse(this.extractJson(raw));
    } catch {
      const repaired = await this.chat(
        [
          { role: "system", content: JSON_REPAIR_SYSTEM },
          { role: "user", content: `Fix this into valid JSON. Return only JSON:\n\n${raw}` },
        ],
        { jsonMode: true, temperature: 0, maxTokens: 8000 }
      );
      try {
        obj = JSON.parse(this.extractJson(repaired));
      } catch {
        throw new ProviderError(
          `${this.id} produced malformed JSON for claim audit.`,
          this.id
        );
      }
    }

    const audit = coerceAudit(obj);
    if (audit.claims.length === 0) {
      throw new ProviderError(
        `${this.id} returned no usable claims. Try again or shorten the input.`,
        this.id
      );
    }
    return audit;
  }

  async analyzeImage(
    imageBase64: string,
    mimeType: string
  ): Promise<ImageAnalysisResponse> {
    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:${mimeType};base64,${imageBase64}`;
    const raw = await this.chat(
      [
        { role: "system", content: IMAGE_ANALYSIS_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: IMAGE_ANALYSIS_USER },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      { model: this.cfg.visionModel, jsonMode: true }
    );
    return this.parseWithRepair(
      raw,
      ImageAnalysisResponseSchema,
      "image analysis"
    );
  }

  async rewritePitch(input: string, tone: RewriteTone): Promise<string> {
    const raw = await this.chat(
      [
        { role: "system", content: rewriteSystem(tone) },
        { role: "user", content: input },
      ],
      { temperature: 0.5 }
    );
    return raw.trim().replace(/^["']|["']$/g, "");
  }

  async generateEvidencePack(
    audit: ClaimAuditResponse
  ): Promise<EvidencePackResponse> {
    const raw = await this.chat(
      [
        { role: "system", content: EVIDENCE_PACK_SYSTEM },
        { role: "user", content: JSON.stringify(audit) },
      ],
      { jsonMode: true }
    );
    return this.parseWithRepair(
      raw,
      EvidencePackResponseSchema,
      "evidence pack"
    );
  }

  async analyzeCompetitors(
    ctx: IntelContext,
    sources: SearchResult[]
  ): Promise<IntelModelOutput> {
    const raw = await this.chat(
      [
        { role: "system", content: INTEL_SYSTEM },
        { role: "user", content: intelUser(ctx, sources) },
      ],
      { jsonMode: true, temperature: 0.3 }
    );
    return this.parseWithRepair(
      raw,
      IntelModelOutputSchema,
      "competitive intelligence"
    );
  }
}
