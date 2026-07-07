import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function scoreColor(score: number): string {
  if (score >= 70) return "hsl(var(--proven))";
  if (score >= 45) return "hsl(var(--warn))";
  return "hsl(var(--risk))";
}

export function scoreLabel(score: number): string {
  if (score >= 70) return "Credible";
  if (score >= 45) return "Needs work";
  return "High risk";
}
