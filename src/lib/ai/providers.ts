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
  const model = process.env[`${upper}_MODEL`] || defaults[id].model;
  return {
    id,
    apiKey: process.env[`${upper}_API_KEY`] ?? "",
    baseUrl: process.env[`${upper}_BASE_URL`] || defaults[id].base,
    model,
    visionModel: process.env[`${upper}_VISION_MODEL`] || model,
  };
}

/** Resolve the active provider id from AI_PROVIDER (defaults to nvidia). */
export function activeProviderId(): ProviderId {
  const raw = (process.env.AI_PROVIDER || "nvidia").toLowerCase();
  if (raw === "fireworks" || raw === "amd" || raw === "nvidia") return raw;
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
