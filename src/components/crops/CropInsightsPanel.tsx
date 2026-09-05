'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ClipboardList, Sprout, Wallet } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { INSIGHT_PRIORITY_STYLES, type FarmInsight } from '@/lib/insights';

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

export default function CropInsightsPanel({
  farmId,
  cropId,
  className = '',
}: {
  farmId: string;
  cropId: string;
  className?: string;
}) {
  const { farmPath } = useFarmPaths(farmId);
  const [insights, setInsights] = useState<FarmInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    if (!farmId || !cropId) return;
    setLoading(true);
    try {
      const response = await apiClient.getFarmInsights(farmId, cropId);
      if (!response.success) {
        setInsights([]);
        return;
      }
      setInsights((response.data || []) as FarmInsight[]);
    } catch (err) {
      console.error('Error fetching crop insights:', err);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [farmId, cropId]);

  useEffect(() => {
    void fetchInsights();
  }, [fetchInsights]);

  const shell = `overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80 ${className}`;

  if (loading) {
    return (
      <div className={`max-lg:hidden ${shell}`}>
        <div className="border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Insights</p>
        </div>
        <div className="space-y-2 px-4 py-3">
          <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/70" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/70" />
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className={`max-lg:hidden ${shell}`}>
        <div className="border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Insights</p>
        </div>
        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          You&apos;re all caught up on this crop.
        </p>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Insights</h2>
        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
          {insights.length} {insights.length === 1 ? 'item' : 'items'}
        </p>
      </div>
      <ul className="max-h-[18rem] overflow-y-auto overscroll-contain divide-y divide-gray-100 [scrollbar-width:thin] dark:divide-gray-700/80">
        {insights.map((insight) => {
          const styles = INSIGHT_PRIORITY_STYLES[insight.priority] || INSIGHT_PRIORITY_STYLES.info;
          return (
            <li key={insight.id} className="px-4 py-2.5">
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles.wrap}`}
                >
                  <InsightIcon type={insight.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-gray-800 dark:text-gray-200">{insight.body}</p>
                  {insight.hint ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{insight.hint}</p>
                  ) : null}
                  {insight.action ? (
                    <Link
                      href={farmPath(insight.action.href)}
                      className="mt-1 inline-flex min-h-10 items-center text-xs font-semibold text-primary-600 dark:text-primary-400 md:min-h-0 md:mt-1"
                    >
                      {insight.action.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
