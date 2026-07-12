// Ported from the standalone ProofPilot chatbot: src/services/aiClient.js
// Logic preserved. The only change from the original is that sendChatToProvider
// accepts an optional systemPrompt so the integration can inject the current
// audit's context; it defaults to the configured ProofPilot Mentor prompt.

import { getProviderConfiguration } from '../config';
import { uncertainResponseMessage } from '../prompts/proofpilotMentor';

type ProviderError = Error & { statusCode?: number; expose?: boolean };

function buildProviderError(message: string, statusCode = 500, expose = true): ProviderError {
  const error = new Error(message) as ProviderError;
  error.statusCode = statusCode;
  error.expose = expose;
  return error;
}

function redactSensitiveProviderText(value: unknown): string {
  return String(value).replace(/\b[A-Za-z0-9_-]*api-[A-Za-z0-9_-]+\b/g, '[redacted-api-key]');
}

export function interpretAssistantResponse(payload: unknown): string {
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })
    ?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    return uncertainResponseMessage;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Model didn't return the JSON contract (e.g. response_format unsupported) —
    // fall back to its plain-text answer instead of a canned refusal.
    return content.trim();
  }

  if (!parsed || typeof parsed !== 'object') {
    return content.trim();
  }

  const obj = parsed as { confidence?: unknown; answer?: unknown };
  const confidence = typeof obj.confidence === 'string' ? obj.confidence.toLowerCase() : '';
  const answer = typeof obj.answer === 'string' ? obj.answer.trim() : '';

  if (confidence !== 'high' || !answer) {
    return uncertainResponseMessage;
  }

  if (answer === uncertainResponseMessage) {
    return uncertainResponseMessage;
  }

  return answer;
}

export type ConversationTurn = { role: 'user' | 'assistant'; content: string };

export async function sendChatToProvider(
  message: string,
  systemPromptOverride?: string,
  history: ConversationTurn[] = []
): Promise<string> {
  const { provider, baseUrl, apiKey, model, providerTimeoutMs, systemPrompt } =
    getProviderConfiguration();

  if (!message || !message.trim()) {
    throw buildProviderError('Message is required.', 400);
  }

  if (provider !== 'openai-compatible') {
    throw buildProviderError(`Unsupported AI provider: ${provider}`, 500);
  }

  if (!apiKey) {
    throw buildProviderError('ProofPilot is temporarily unavailable. Please try again shortly.', 503);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), providerTimeoutMs);

  const post = (useJson: boolean): Promise<Response> =>
    fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPromptOverride || systemPrompt },
          // Recent conversation turns so follow-ups ("but why?") have context.
          ...history.slice(-6),
          { role: 'user', content: message.trim() },
        ],
        temperature: 0.4,
        ...(useJson ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    });

  const onNetworkError = (error: unknown): never => {
    if ((error as { name?: string })?.name === 'AbortError') {
      throw buildProviderError('The AI service took too long to respond. Please try again in a moment.', 504);
    }
    throw buildProviderError('ProofPilot could not reach the AI service. Please try again in a moment.', 503);
  };

  try {
    let response: Response;
    try {
      response = await post(true);
    } catch (error) {
      return onNetworkError(error);
    }

    // If the endpoint rejects response_format json_object (400), retry once
    // without it — interpretAssistantResponse handles plain-text answers too.
    if (!response.ok && response.status === 400) {
      const probe = await response.clone().text().catch(() => '');
      if (/response_format|json/i.test(probe)) {
        try {
          response = await post(false);
        } catch (error) {
          return onNetworkError(error);
        }
      }
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw buildProviderError('AI provider returned an invalid response.', 502);
    }

    if (!response.ok) {
      const errPayload = payload as { error?: { message?: string }; message?: string };
      const providerMessage =
        errPayload?.error?.message ||
        errPayload?.message ||
        'ProofPilot received an unexpected response from the AI service.';
      const statusCode =
        response.status === 408 || response.status === 504
          ? 504
          : response.status >= 500
            ? 502
            : response.status;
      console.error('AI provider error:', redactSensitiveProviderText(providerMessage));
      throw buildProviderError('ProofPilot could not complete the request. Please try again in a moment.', statusCode);
    }

    return interpretAssistantResponse(payload);
  } finally {
    clearTimeout(timeoutId);
  }
}
