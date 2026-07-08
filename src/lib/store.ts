"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  SavedAudit,
  ClaimAuditResponse,
  EvidenceItem,
  StrategyTask,
  CompetitiveSignal,
} from "@/lib/schemas";
import { uid } from "@/lib/utils";

type NewAuditInput = {
  title: string;
  sourceType: SavedAudit["sourceType"];
  documentName?: string;
  originalText: string;
  providerUsed: SavedAudit["providerUsed"];
  audit: ClaimAuditResponse;
};

type AuditsState = {
  audits: SavedAudit[];
  activeId: string | null;

  createAudit: (input: NewAuditInput) => string;
  getAudit: (id: string) => SavedAudit | undefined;
  setActive: (id: string | null) => void;
  renameAudit: (id: string, title: string) => void;
  duplicateAudit: (id: string) => string | null;
  deleteAudit: (id: string) => void;

  setRewrite: (id: string, rewrite: string) => void;
  appendRewrite: (id: string, text: string) => void;
  setCompetitiveIntel: (
    id: string,
    intel: SavedAudit["competitiveIntel"]
  ) => void;
  applyCompetitiveSignals: (id: string, signals: CompetitiveSignal[]) => void;
  applyReaudit: (id: string, newAudit: ClaimAuditResponse, newText: string) => void;
  addStrategyTask: (id: string, task: StrategyTask) => void;
  toggleStrategyTask: (id: string, taskId: string) => void;
  addEvidence: (id: string, item: EvidenceItem) => void;
  updateEvidence: (id: string, itemId: string, patch: Partial<EvidenceItem>) => void;
  removeEvidence: (id: string, itemId: string) => void;
  updateClaimGroup: (
    id: string,
    claimId: string,
    group: ClaimAuditResponse["claims"][number]["group"]
  ) => void;
};

export const useAudits = create<AuditsState>()(
  persist(
    (set, get) => ({
      audits: [],
      activeId: null,

      createAudit: (input) => {
        const now = new Date().toISOString();
        const audit: SavedAudit = {
          id: uid("audit"),
          title: input.title || "Untitled audit",
          sourceType: input.sourceType,
          documentName: input.documentName,
          originalText: input.originalText,
          providerUsed: input.providerUsed,
          audit: input.audit,
          evidenceItems: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ audits: [audit, ...s.audits], activeId: audit.id }));
        return audit.id;
      },

      getAudit: (id) => get().audits.find((a) => a.id === id),
      setActive: (id) => set({ activeId: id }),

      renameAudit: (id, title) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id ? { ...a, title, updatedAt: new Date().toISOString() } : a
          ),
        })),

      duplicateAudit: (id) => {
        const src = get().audits.find((a) => a.id === id);
        if (!src) return null;
        const now = new Date().toISOString();
        const copy: SavedAudit = {
          ...src,
          id: uid("audit"),
          title: `${src.title} (copy)`,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ audits: [copy, ...s.audits] }));
        return copy.id;
      },

      deleteAudit: (id) =>
        set((s) => ({
          audits: s.audits.filter((a) => a.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),

      setRewrite: (id, rewrite) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? { ...a, rewrittenPitch: rewrite, updatedAt: new Date().toISOString() }
              : a
          ),
        })),

      appendRewrite: (id, text) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  rewrittenPitch: a.rewrittenPitch
                    ? `${a.rewrittenPitch}\n\n${text}`
                    : text,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      setCompetitiveIntel: (id, intel) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  competitiveIntel: intel,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      applyCompetitiveSignals: (id, signals) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  competitiveSignals: {
                    ...(a.competitiveSignals ?? {}),
                    ...Object.fromEntries(signals.map((x) => [x.claimId, x])),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      applyReaudit: (id, newAudit, newText) =>
        set((s) => ({
          audits: s.audits.map((a) => {
            if (a.id !== id) return a;
            const now = new Date().toISOString();
            const base =
              a.revisions && a.revisions.length
                ? a.revisions
                : [
                    {
                      label: "Original",
                      text: a.originalText,
                      score: a.audit.overall_credibility_score,
                      createdAt: a.createdAt,
                    },
                  ];
            return {
              ...a,
              revisions: [
                ...base,
                {
                  label: `v${base.length}`,
                  text: newText,
                  score: newAudit.overall_credibility_score,
                  createdAt: now,
                },
              ],
              audit: newAudit,
              originalText: newText,
              rewrittenPitch: undefined,
              updatedAt: now,
            };
          }),
        })),

      addStrategyTask: (id, task) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  strategyTasks: [...(a.strategyTasks ?? []), task],
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      toggleStrategyTask: (id, taskId) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  strategyTasks: (a.strategyTasks ?? []).map((t) =>
                    t.id === taskId ? { ...t, done: !t.done } : t
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      addEvidence: (id, item) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  evidenceItems: [...a.evidenceItems, item],
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      updateEvidence: (id, itemId, patch) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  evidenceItems: a.evidenceItems.map((it) =>
                    it.id === itemId ? { ...it, ...patch } : it
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      removeEvidence: (id, itemId) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  evidenceItems: a.evidenceItems.filter((it) => it.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      updateClaimGroup: (id, claimId, group) =>
        set((s) => ({
          audits: s.audits.map((a) =>
            a.id === id
              ? {
                  ...a,
                  audit: {
                    ...a.audit,
                    claims: a.audit.claims.map((c) =>
                      c.id === claimId ? { ...c, group } : c
                    ),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),
    }),
    {
      name: "proofpilot.audits.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ audits: s.audits }),
    }
  )
);
