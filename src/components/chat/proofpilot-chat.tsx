"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Eraser } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

type ChatMessage = { role: "user" | "assistant"; text: string };

type Props = {
  context: string;
  ready?: boolean;
  title?: string;
  subtitle?: string;
  intro?: string;
  starters?: string[];
  scopeKey?: string;
};

const DEFAULT_STARTERS = [
  "Summarize this audit",
  "What are my biggest risks?",
  "How do I strengthen my weakest claim?",
  "What should I do next?",
];

const AI_GRADIENT = "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 60%) 100%)";

function friendlyError(status: number, serverMessage?: string): string {
  if (serverMessage) return serverMessage;
  if (status === 429) return "ProofPilot is busy right now. Please wait a moment and try again.";
  if (status === 503) return "The assistant is temporarily unavailable. Please try again shortly.";
  if (status === 504) return "That took too long to finish. Please try again in a moment.";
  return "I couldn't complete that request. Please try again in a moment.";
}

export function ProofPilotChat({
  context,
  ready = true,
  title = "ProofPilot Assistant",
  subtitle = "Grounded in this audit only",
  intro = "Hi! I'm your ProofPilot assistant. Ask me anything about this analysis — the claims, risks, competitors, or your next steps. I only use the data from this audit.",
  starters = DEFAULT_STARTERS,
  scopeKey,
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { setMessages([]); }, [scopeKey]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.text }));
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, context, history }),
        signal: controller.signal,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", text: friendlyError(res.status, payload?.error) }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: payload.assistantResponse || "I don't have a response available right now." }]);
      }
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === "AbortError";
      setMessages((m) => [...m, { role: "assistant", text: aborted ? "That took too long to finish. Please try again in a moment." : "I'm having trouble responding right now. Please try again in a moment." }]);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  const AssistantAvatar = () => (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm" style={{ background: AI_GRADIENT }}>
      <Sparkles className="h-3.5 w-3.5" />
    </div>
  );

  // Nothing to talk about yet (e.g. the startup report hasn't been generated) —
  // stay out of the way instead of crowding the page's primary actions.
  if (!ready) return null;

  return (
    <>
      {/* Launcher — gently floats up and down with a breathing glow */}
      <motion.div
        className="fixed bottom-5 right-5 z-50"
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* breathing glow (kept subtle so it doesn't crowd nearby buttons) */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: AI_GRADIENT }}
          animate={{ opacity: [0.18, 0.38, 0.18], scale: [0.95, 1.06, 0.95] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* expanding halo ring when closed */}
        <AnimatePresence>
          {!open && (
            <motion.span
              key="halo"
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: AI_GRADIENT }}
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label={open ? "Close assistant" : "Open assistant"}
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ background: AI_GRADIENT }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="h-6 w-6" /></motion.span>
            ) : (
              <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle className="h-6 w-6" /></motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-24 right-5 z-50 h-[min(38rem,calc(100vh-8rem))] w-[min(28rem,calc(100vw-2.5rem))]"
            role="dialog"
            aria-label={title}
          >
            {/* Inner card gently drifts so the panel feels like it's hovering */}
            <motion.div
              className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur-xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Header */}
              <div className="relative overflow-hidden px-4 py-3">
                <div className="absolute inset-0 opacity-90" style={{ background: AI_GRADIENT }} />
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex items-center gap-3 text-white">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"><Sparkles className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-white/80">
                      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
                      {subtitle}
                    </p>
                  </div>
                  {messages.length > 0 && (
                    <button type="button" onClick={() => setMessages([])} aria-label="Clear conversation" title="Clear conversation" className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"><Eraser className="h-4 w-4" /></button>
                  )}
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
              </div>

              {/* Messages */}
              <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" style={{ background: "radial-gradient(120% 60% at 50% 0%, hsl(var(--primary) / 0.06), transparent 70%)" }}>
                {messages.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5">
                    <AssistantAvatar />
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border/60 bg-background/60 px-3.5 py-2.5 text-sm leading-6 text-muted-foreground">{intro}</div>
                  </motion.div>
                )}
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <motion.div key={i} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18 }} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2 text-sm text-white shadow-sm" style={{ background: AI_GRADIENT }}>{m.text}</div>
                    </motion.div>
                  ) : (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="flex items-start gap-2.5">
                      <AssistantAvatar />
                      <div className="markdown-chat max-w-[85%] rounded-2xl rounded-tl-sm border border-border/60 bg-background/60 px-3.5 py-2.5 text-sm leading-6 text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
                    </motion.div>
                  )
                )}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5">
                    <AssistantAvatar />
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border/60 bg-background/60 px-4 py-3">
                      <motion.span className="h-2 w-2 rounded-full bg-primary/70" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.span className="h-2 w-2 rounded-full bg-primary/70" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                      <motion.span className="h-2 w-2 rounded-full bg-primary/70" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </motion.div>
                )}

                {/* Suggested follow-up questions after the latest answer */}
                {!loading &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === "assistant" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex flex-wrap gap-2 pl-9"
                    >
                      {starters
                        .filter((s) => !messages.some((m) => m.text === s))
                        .slice(0, 3)
                        .map((s) => (
                          <motion.button
                            key={s}
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => send(s)}
                            className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-foreground/70 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-foreground"
                          >
                            {s}
                          </motion.button>
                        ))}
                    </motion.div>
                  )}
              </div>

              {/* Starter prompts */}
              {messages.length === 0 && ready && (
                <div className="flex flex-wrap gap-2 px-4 pb-2">
                  {starters.map((s) => (
                    <motion.button key={s} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => send(s)} className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-foreground">{s}</motion.button>
                  ))}
                </div>
              )}

              {/* Composer */}
              <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border/60 bg-card/80 p-3">
                <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-background/60 p-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                  <textarea ref={inputRef} rows={1} value={input} disabled={!ready} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder={ready ? "Ask about this audit…" : "Generate an analysis first to chat"} className="max-h-32 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" />
                  <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} disabled={loading || !input.trim() || !ready} aria-label="Send message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-opacity disabled:opacity-40" style={{ background: AI_GRADIENT }}><Send className="h-4 w-4" /></motion.button>
                </div>
                <p className="mt-1.5 px-1 text-center text-[10px] text-muted-foreground">Answers use only this audit&apos;s data · AI can make mistakes</p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProofPilotChat;
