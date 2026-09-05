/**
 * Display helpers for Phase 3 farm insights.
 * Insight rules live on the backend intelligence engine — do not reimplement them here.
 */

export type InsightPriority = 'high' | 'medium' | 'low' | 'info';

export type FarmInsight = {
  id: string;
  type: string;
  priority: InsightPriority;
  title: string;
  body: string;
  hint?: string;
  cropId?: string;
  taskId?: string;
  action?: { href: string; label: string };
  metrics?: { label: string; value: number }[];
};

const STORAGE_PREFIX = 'farmkeeper.insights.dismissed.';

export function readDismissedInsightIds(farmId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${farmId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function writeDismissedInsightIds(farmId: string, ids: string[]) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(`${STORAGE_PREFIX}${farmId}`, JSON.stringify(ids));
}

export const INSIGHT_PRIORITY_STYLES: Record<
  InsightPriority,
  { dot: string; wrap: string }
> = {
  high: {
    dot: 'bg-amber-500',
    wrap: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
  },
  medium: {
    dot: 'bg-yellow-400',
    wrap: 'bg-yellow-50 text-yellow-950 dark:bg-yellow-950/30 dark:text-yellow-100',
  },
  low: {
    dot: 'bg-sky-400',
    wrap: 'bg-sky-50 text-sky-950 dark:bg-sky-950/30 dark:text-sky-100',
  },
  info: {
    dot: 'bg-emerald-500',
    wrap: 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100',
  },
};
