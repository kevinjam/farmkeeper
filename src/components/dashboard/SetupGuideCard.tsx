'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { useFarmActivitySnapshot } from '@/hooks/useFarmActivitySnapshot';
import {
  buildSetupSteps,
  dismissSetupGuide,
  isSetupGuideDismissed,
  setupProgress,
  shouldShowSetupGuide,
} from '@/lib/setupGuide';

export default function SetupGuideCard({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const { snapshot, loading } = useFarmActivitySnapshot(farmId);
  const [userId, setUserId] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    if (!farmId) return;
    let cancelled = false;
    const load = async () => {
      const status = await apiClient.getAuthStatus();
      const id = status.data?.user?.id ? String(status.data.user.id) : '';
      if (cancelled) return;
      setUserId(id);
      setDismissed(isSetupGuideDismissed(id, farmId));
      setUserReady(true);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [farmId]);

  if (loading || snapshot.failed || dismissed || !userReady) return null;

  const steps = buildSetupSteps(snapshot.counts, snapshot.access);
  if (!shouldShowSetupGuide(snapshot.counts, steps, false) || !steps.length) return null;

  const progress = setupProgress(steps);

  return (
    <section className="overflow-hidden rounded-lg border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-white shadow dark:border-emerald-900/40 dark:from-emerald-950/30 dark:via-gray-800 dark:to-gray-800 max-md:rounded-2xl max-md:shadow-md">
      <div className="px-4 py-4 md:px-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">👋 Let&apos;s get your farm set up</h2>
        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
          Complete these steps to get the most out of FarmKeeper.
        </p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span>{progress.label}</span>
            <span>{progress.percent}%</span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/60"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.completed}
            aria-label={progress.label}
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width]"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {steps.map((step, index) => (
            <li key={step.id}>
              {step.done ? (
                <div className="flex min-h-11 items-center gap-3 rounded-xl bg-white/70 px-3 py-2.5 dark:bg-gray-900/40">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="text-sm text-gray-500 line-through dark:text-gray-400">{step.title}</span>
                </div>
              ) : (
                <Link
                  href={farmPath(step.href)}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-200/80 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-900/50 dark:text-white dark:ring-gray-700"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 text-[11px] font-bold text-gray-400 dark:border-gray-600">
                      {index + 1}
                    </span>
                    <span>{step.title}</span>
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary-700 dark:text-primary-300">
                    {step.action}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={!userId}
          onClick={() => {
            if (!userId) return;
            dismissSetupGuide(userId, farmId);
            setDismissed(true);
          }}
          className="mt-3 min-h-11 text-sm font-semibold text-gray-500 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Hide setup guide
        </button>
      </div>
    </section>
  );
}
