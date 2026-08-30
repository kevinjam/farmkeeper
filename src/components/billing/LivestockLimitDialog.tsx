'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { getPlanLabel, getUpgradeTarget, type PaidPlanId } from '@/lib/billing';

type Props = {
  open: boolean;
  onClose: () => void;
  farmId: string;
  limit: number;
  currentCount: number;
};

export default function LivestockLimitDialog({
  open,
  onClose,
  farmId,
  limit,
  currentCount,
}: Props) {
  const { farmPath } = useFarmPaths(farmId);
  const subscription = useSubscriptionContext();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const upgrade = getUpgradeTarget({
    plan: subscription.plan,
    subscriptionStatus: subscription.isFarmerTrial ? 'trial' : 'active',
    livestockLimit: subscription.livestockLimit,
    features: subscription.features,
    autoRenew: false,
    daysLeft: subscription.daysLeft,
    isExpired: subscription.isTrialExpired,
    isTrialExpired: subscription.isTrialExpired,
    isFarmerTrial: subscription.isFarmerTrial,
  });
  const upgradeLabel = getPlanLabel((upgrade || 'farmer') as PaidPlanId);
  const billingHref = `${farmPath('/dashboard/billing')}?tab=plans`;
  const used = Math.min(currentCount, limit);
  const progress = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;

  const headline = subscription.isFarmerTrial
    ? `Your Farmer trial includes up to ${limit} animals.`
    : subscription.isTrialExpired
      ? `Your trial has ended. The Free plan includes up to ${limit} animals.`
      : `Your ${getPlanLabel(subscription.plan)} plan includes up to ${limit} animals.`;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="livestock-limit-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-gray-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6 pb-5 pt-6 dark:from-amber-950/40 dark:via-gray-900 dark:to-emerald-950/30">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
            <Crown className="h-7 w-7" />
          </div>
          <h2
            id="livestock-limit-title"
            className="mt-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            You&apos;ve reached your animal limit
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{headline}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Subscribe to keep adding livestock and unlock the rest of FarmKeeper.
          </p>

          <div className="mt-5 rounded-2xl border border-amber-200/80 bg-white/80 px-4 py-3 dark:border-amber-900/50 dark:bg-gray-950/40">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <span>Animals on this farm</span>
              <span className="tabular-nums text-amber-800 dark:text-amber-200">
                {used} / {limit}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-gray-100 px-6 py-5 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">What you get next</p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <li className="flex justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/70">
              <span>Farmer</span>
              <span className="font-semibold">Up to 50 animals</span>
            </li>
            <li className="flex justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/70">
              <span>Premium</span>
              <span className="font-semibold">Unlimited animals</span>
            </li>
          </ul>

          <div className="flex flex-col gap-2 pt-3 sm:flex-row-reverse">
            <Button asChild className="min-h-11 w-full gap-2 rounded-xl sm:w-auto">
              <Link href={billingHref}>
                <Crown className="h-4 w-4" />
                Upgrade to {upgradeLabel}
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full rounded-xl sm:w-auto"
              onClick={onClose}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
