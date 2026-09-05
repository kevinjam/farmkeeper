'use client';

import Link from 'next/link';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import type { NextStepRecommendation } from '@/lib/nextStep';

export default function NextStepCard({
  farmId,
  recommendation,
  loading,
}: {
  farmId: string;
  recommendation: NextStepRecommendation | null;
  loading: boolean;
}) {
  const { farmPath } = useFarmPaths(farmId);

  if (loading) {
    return (
      <section className="overflow-hidden rounded-lg border border-sky-200/70 bg-white shadow dark:border-sky-900/40 dark:bg-gray-800 max-md:rounded-2xl max-md:shadow-md">
        <div className="animate-pulse px-4 py-4 md:px-5">
          <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-3 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-4 h-11 w-40 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </section>
    );
  }

  if (!recommendation?.title || !recommendation.href) return null;

  return (
    <section
      aria-live="polite"
      className="overflow-hidden rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-white shadow dark:border-sky-900/40 dark:from-sky-950/30 dark:via-gray-800 dark:to-gray-800 max-md:rounded-2xl max-md:shadow-md"
    >
      <div className="px-4 py-4 md:px-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">🎯 What should I do next?</h2>
        <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{recommendation.title}</p>
        {recommendation.detail ? (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{recommendation.detail}</p>
        ) : null}
        <Link
          href={farmPath(recommendation.href)}
          className="btn btn-primary mt-4 inline-flex min-h-11 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 max-md:w-full max-md:rounded-xl"
        >
          {recommendation.action}
        </Link>
      </div>
    </section>
  );
}
