// Ported from the standalone ProofPilot chatbot: src/config.js
// Structure preserved. The only integration change is a documented fallback to
// ProofPilot's existing NVIDIA_* env vars when the chatbot's own AI_* vars are
// not set, so the assistant runs without adding new keys.

import { proofpilotMentorPrompt } from './prompts/proofpilotMentor';

function normalizeApiKey(value: string | undefined): string {
  const apiKey = value?.trim() || '';
  if (!apiKey || apiKey === 'your_api_key_here') {
    return '';
  }
  return apiKey;
}

// Follow the SAME provider the core app uses (AI_PROVIDER) so the assistant runs
// on the exact endpoint/model you configured (e.g. AMD_MODEL) — not a stale
// FIREWORKS_MODEL that merely happens to be set in .env. Falls back afterwards.
const activeProvider = (process.env.AI_PROVIDER || '').toLowerCase().trim();
const activePrefix =
  activeProvider === 'fireworks'
    ? 'FIREWORKS'
    : activeProvider === 'nvidia'
      ? 'NVIDIA'
      : activeProvider === 'amd'
        ? 'AMD'
        : '';
const active = (suffix: string): string | undefined =>
  activePrefix ? process.env[`${activePrefix}_${suffix}`] : undefined;

export const config = {
  // Always OpenAI-compatible transport. (ProofPilot uses AI_PROVIDER for its own
  // nvidia|fireworks|amd selection; here we mirror that choice for the endpoint.)
  provider: 'openai-compatible',
  // Order: explicit chatbot vars -> the ACTIVE provider's vars -> other providers.
  baseUrl:
    process.env.AI_BASE_URL ||
    active('BASE_URL') ||
    process.env.FIREWORKS_BASE_URL ||
    process.env.AMD_BASE_URL ||
    process.env.NVIDIA_BASE_URL ||
    'https://integrate.api.nvidia.com/v1',
  apiKey: normalizeApiKey(
    process.env.AI_API_KEY ||
      active('API_KEY') ||
      process.env.FIREWORKS_API_KEY ||
      process.env.AMD_API_KEY ||
      process.env.NVIDIA_API_KEY
  ),
  model:
    process.env.AI_MODEL ||
    active('MODEL') ||
    process.env.FIREWORKS_MODEL ||
    process.env.AMD_MODEL ||
    process.env.NVIDIA_MODEL ||
    'meta/llama-3.1-70b-instruct',
  providerTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 45_000,
  systemPrompt: process.env.AI_SYSTEM_PROMPT || proofpilotMentorPrompt,
};

export function getProviderConfiguration() {
  return {
    provider: config.provider,
    baseUrl: config.baseUrl.replace(/\/$/, ''),
    apiKey: config.apiKey,
    model: config.model,
    providerTimeoutMs: config.providerTimeoutMs,
    systemPrompt: config.systemPrompt,
  };
}
