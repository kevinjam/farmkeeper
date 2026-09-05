'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ClipboardList, Sprout, Wallet, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  INSIGHT_PRIORITY_STYLES,
  readDismissedInsightIds,
  writeDismissedInsightIds,
  type FarmInsight,
} from '@/lib/insights';

function InsightIcon({ type }: { type: string }) {
  if (type === 'UPCOMING_TASK') return <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />;
  if (type === 'CROP_EXPENSE_SUMMARY' || type === 'WEEKLY_EXPENSE_SUMMARY') {
    return <Wallet className="h-3.5 w-3.5" strokeWidth={2} />;
  }
  if (type === 'UPCOMING_HARVEST' || type === 'CROP_PROFILE_INCOMPLETE') {
    return <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />;
  }
  return <Sprout className="h-3.5 w-3.5" strokeWidth={2} />;
}

function useOverflow(itemCount: number) {
  const ref = useRef<HTMLUListElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || itemCount === 0) {
      setHasOverflow(false);
      setAtBottom(true);
      return;
    }

    const update = () => {
      const overflow = el.scrollHeight > el.clientHeight + 2;
      setHasOverflow(overflow);
      setAtBottom(!overflow || el.scrollTop + el.clientHeight >= el.scrollHeight - 6);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [itemCount]);

  return { ref, hasOverflow, atBottom };
}

export default function FarmInsightsCard({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const [insights, setInsights] = useState<FarmInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const fetchInsights = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const response = await apiClient.getFarmInsights(farmId);
      if (!response.success) {
        setInsights([]);
        return;
      }
      setInsights((response.data || []) as FarmInsight[]);
    } catch (err) {
      console.error('Error fetching farm insights:', err);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    setDismissed(readDismissedInsightIds(farmId));
    void fetchInsights();
  }, [farmId, fetchInsights]);

  const visible = useMemo(
    () => insights.filter((insight) => !dismissed.includes(insight.id)),
    [insights, dismissed]
  );

  const { ref: listRef, hasOverflow, atBottom } = useOverflow(visible.length);

  const dismiss = (id: string) => {
    const next = Array.from(new Set([...dismissed, id]));
    setDismissed(next);
    writeDismissedInsightIds(farmId, next);
  };

  return (
    <div className="flex h-full min-h-0 max-h-[16rem] flex-col overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80 lg:max-h-none">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
        <div className="flex min-w-0 items-center gap-2">
          <Sprout className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <h2 className="truncate text-sm font-bold text-gray-900 dark:text-white">Crop Insights</h2>
        </div>
        {!loading && visible.length > 0 ? (
          <p className="shrink-0 text-[11px] font-medium text-gray-400 dark:text-gray-500">
            {visible.length} {visible.length === 1 ? 'item' : 'items'}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-2 px-4 py-3">
          <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/70" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/70" />
        </div>
      ) : visible.length === 0 ? (
        <p className="flex flex-1 items-center px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          You&apos;re all caught up.
        </p>
      ) : (
        <div className="relative min-h-0 flex-1">
          <ul
            ref={listRef}
            className="h-full overflow-y-auto overscroll-contain divide-y divide-gray-100 [scrollbar-width:thin] [scrollbar-color:rgb(156_163_175)_transparent] dark:divide-gray-700/80"
            aria-label="Crop insights"
          >
            {visible.map((insight) => {
              const styles = INSIGHT_PRIORITY_STYLES[insight.priority] || INSIGHT_PRIORITY_STYLES.info;
              const action = insight.action;
              const alreadyOnCropsList = action?.href === '/dashboard/crops';
              return (
                <li key={insight.id} className="px-4 py-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${styles.wrap}`}
                    >
                      <InsightIcon type={insight.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-snug text-gray-800 dark:text-gray-200">
                        {insight.body}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        {action && !alreadyOnCropsList ? (
                          <Link
                            href={farmPath(action.href)}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-800 dark:text-primary-400"
                          >
                            {action.label}
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => dismiss(insight.id)}
                          className="inline-flex min-h-8 items-center gap-0.5 text-xs font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          <X className="h-3 w-3" strokeWidth={2.5} />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {hasOverflow && !atBottom ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-gray-800"
              aria-hidden
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
