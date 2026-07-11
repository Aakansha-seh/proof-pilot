import { OpenAICompatibleProvider } from "./openai-compatible";
import { AIProvider, ProviderConfig, ProviderId } from "./types";

// Provider-specific request logic is isolated in dedicated subclasses.
// They all share the OpenAI-compatible transport but can override defaults.

export class NvidiaProvider extends OpenAICompatibleProvider {}
export class FireworksProvider extends OpenAICompatibleProvider {}
export class AmdProvider extends OpenAICompatibleProvider {}

function envConfig(id: ProviderId): ProviderConfig {
  const upper = id.toUpperCase();
  const defaults: Record<ProviderId, { base: string; model: string }> = {
    nvidia: {
      base: "https://integrate.api.nvidia.com/v1",
      model: "meta/llama-3.1-70b-instruct",
    },
    fireworks: {
      base: "https://api.fireworks.ai/inference/v1",
      model: "accounts/fireworks/models/llama-v3p1-70b-instruct",
    },
    amd: { base: "", model: "" },
  };
  // Trim so a stray space/newline pasted into a dashboard env var (e.g.
  // "amd " or a key with a trailing newline) doesn't silently break things.
  const trim = (v?: string) => (v ?? "").trim();
  const model = trim(process.env[`${upper}_MODEL`]) || defaults[id].model;
  return {
    id,
    apiKey: trim(process.env[`${upper}_API_KEY`]),
    baseUrl: trim(process.env[`${upper}_BASE_URL`]) || defaults[id].base,
    model,
    visionModel: trim(process.env[`${upper}_VISION_MODEL`]) || model,
  };
}

/** True when the AMD inference path is fully configured (key + base URL). */
export function amdConfigured(): boolean {
  return Boolean(process.env.AMD_API_KEY && process.env.AMD_BASE_URL);
}

/**
 * Provider for the Competitive Intelligence workload. Prefers the AMD
 * inference path when configured (per the AMD workload spec); otherwise
 * falls back to the active provider.
 */
export function getIntelProvider(): { provider: AIProvider; usedAmd: boolean } {
  if (amdConfigured()) {
    return { provider: getProvider("amd"), usedAmd: true };
  }
  return { provider: getProvider(), usedAmd: false };
}

/**
 * Resolve the active provider id. Prefers an explicit AI_PROVIDER (whitespace
 * tolerated); if that isn't set, auto-selects whichever provider actually has
 * credentials configured, so setting the AMD_* vars alone is enough.
 */
export function activeProviderId(): ProviderId {
  const raw = (process.env.AI_PROVIDER || "").toLowerCase().trim();
  if (raw === "fireworks" || raw === "amd" || raw === "nvidia") return raw;
  // No explicit (valid) choice — fall back to whatever is configured.
  if (process.env.AMD_API_KEY && process.env.AMD_BASE_URL) return "amd";
  if (process.env.FIREWORKS_API_KEY) return "fireworks";
  return "nvidia";
}

/** Factory. Use AI_PROVIDER to select the active provider. */
export function getProvider(id: ProviderId = activeProviderId()): AIProvider {
  const cfg = envConfig(id);
  switch (id) {
    case "nvidia":
      return new NvidiaProvider(cfg);
    case "fireworks":
      return new FireworksProvider(cfg);
    case "amd":
      return new AmdProvider(cfg);
  }
}
