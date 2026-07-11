// Ported from the standalone ProofPilot chatbot: src/routes/chat.js
// The original Node http handler is adapted into a framework-agnostic function
// so the Next.js /api/chat route can call it. The message validation, domain
// guard, and provider call mirror the original handleChatRequest. The audit
// context is layered on top of the original prompt here (the prompt file itself
// is left untouched).

import { sendChatToProvider, type ConversationTurn } from '../services/aiClient';
import { classifyProofPilotDomain } from '../services/domainClassifier';
import { proofpilotMentorPrompt } from '../prompts/proofpilotMentor';

const MAX_CONTEXT_CHARS = 12000;

export const outsideScopeResponse =
  'This assistant is specialized in startup mentoring, business strategy, pitching, and evidence validation. Your question falls outside its supported scope.';

export type ChatResult =
  | { status: number; assistantResponse: string }
  | { status: number; error: string };

// Integration-layer guard: questions about the current audit's data should
// always pass, even if the original startup-domain classifier doesn't list the
// exact word. The original classifier file is left unchanged.
const auditVocabulary =
  /\b(audit|claim|claims|risk|risks|score|rewrite|evidence|analysis|analyse|analyze|summary|summarize|summarise|report|reports|whitespace|competitor|competitors|market|pitch|improve|improvement|strengthen|weak|weakest|next|step|steps|stand\s+out|validation|credibility)\b/i;

function isSupported(message: string, hasHistory: boolean): boolean {
  if (classifyProofPilotDomain(message).supported) return true;
  if (auditVocabulary.test(message)) return true;
  // Once a conversation is underway, allow short conversational follow-ups
  // ("but why?", "explain that", "and then?") that carry no domain keyword.
  if (hasHistory && message.trim().split(/\s+/).length <= 6) return true;
  return false;
}

function sanitizeHistory(raw: unknown): ConversationTurn[] {
  if (!Array.isArray(raw)) return [];
  const turns: ConversationTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role === 'user' || role === 'assistant') && typeof content === 'string' && content.trim()) {
      turns.push({ role, content: content.slice(0, 4000) });
    }
  }
  return turns.slice(-6);
}

// Compose the audit context onto the original ProofPilot Mentor prompt so the
// assistant answers only from this audit's data.
function buildSystemPrompt(context: string): string {
  let trimmed = context.trim();
  if (!trimmed) return proofpilotMentorPrompt;
  if (trimmed.length > MAX_CONTEXT_CHARS) {
    trimmed = `${trimmed.slice(0, MAX_CONTEXT_CHARS)}\n…(context truncated)`;
  }

  return `${proofpilotMentorPrompt}

You are assisting with ONE specific ProofPilot audit. Treat the analysis data below as your only source of truth. Ground every answer in it, reference specific claims/risks/competitors/scores when relevant, and never invent details that are not present. If the data does not contain the answer, say so and set confidence to low.

Formatting rules for the "answer" field:
- Put the COMPLETE response inside the single "answer" string. Never stop after an intro line or a trailing colon.
- When you say you will list steps, you MUST include every step in that same "answer" string.
- Use "\\n" for line breaks and "1. ", "2. " for numbered steps (they render as markdown).

=== AUDIT CONTEXT ===
${trimmed}
=== END AUDIT CONTEXT ===`;
}

export async function runProofPilotChat(input: {
  message: unknown;
  context?: unknown;
  history?: unknown;
}): Promise<ChatResult> {
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  const context = typeof input.context === 'string' ? input.context : '';
  const history = sanitizeHistory(input.history);

  if (!message) {
    return { status: 400, error: 'message is required' };
  }
  if (message.length > 4000) {
    return { status: 400, error: 'message is too long' };
  }

  if (!isSupported(message, history.length > 0)) {
    return { status: 200, assistantResponse: outsideScopeResponse };
  }

  const assistantResponse = await sendChatToProvider(
    message,
    buildSystemPrompt(context),
    history
  );
  return { status: 200, assistantResponse };
}
