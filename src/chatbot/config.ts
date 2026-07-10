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

export const config = {
  // Always OpenAI-compatible transport. (Note: ProofPilot uses AI_PROVIDER for
  // its own nvidia|fireworks|amd selection, so the chatbot does not read it to
  // avoid a collision — the endpoint below is what actually routes the call.)
  provider: 'openai-compatible',
  // Fallback chain: chatbot's own vars -> ProofPilot's NVIDIA config -> defaults.
  baseUrl:
    process.env.AI_BASE_URL ||
    process.env.NVIDIA_BASE_URL ||
    'https://integrate.api.nvidia.com/v1',
  apiKey: normalizeApiKey(process.env.AI_API_KEY || process.env.NVIDIA_API_KEY),
  model: process.env.AI_MODEL || process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
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
