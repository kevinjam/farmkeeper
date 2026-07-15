'use client';

import Link from 'next/link';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEATURE_LABELS, getPlanLabel, getUpgradeTarget, PlanId } from '@/lib/billing';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import type { SubscriptionContextValue } from '@/contexts/SubscriptionContext';

interface FeatureGateProps {
  farmId: string;
  feature: string;
  subscription: Pick<SubscriptionContextValue, 'plan' | 'isFarmerTrial' | 'isTrialExpired'>;
}

export default function FeatureGate({ farmId, feature, subscription }: FeatureGateProps) {
  const { farmPath } = useFarmPaths(farmId);
  const featureLabel = FEATURE_LABELS[feature] || feature;
  const upgradePlan = getUpgradeTarget({
    plan: subscription.plan,
    subscriptionStatus: 'active',
    livestockLimit: null,
    features: [],
    autoRenew: false,
    daysLeft: 0,
    isExpired: false,
    isTrialExpired: subscription.isTrialExpired,
    isFarmerTrial: subscription.isFarmerTrial,
    unlockAllFeatures: false,
  });

  const requiredPlan: PlanId =
    feature === 'analytics' || feature === 'billing' ? 'premium' : 'farmer';

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center md:py-24">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
        <Lock className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
        Unlock {featureLabel}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        You are on the <strong>{getPlanLabel(subscription.plan)}</strong> plan.
        Upgrade to <strong>{getPlanLabel(requiredPlan)}</strong> to use{' '}
        {featureLabel.toLowerCase()}.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button asChild className="w-full gap-2">
          <Link href={`${farmPath('/dashboard/billing')}?tab=plans`}>
            <Crown className="h-4 w-4" />
            View plans
          </Link>
        </Button>
        {upgradePlan && upgradePlan !== requiredPlan && (
          <Button asChild variant="outline" className="w-full">
            <Link href={`${farmPath('/dashboard/billing')}?tab=plans`}>
              Compare {getPlanLabel(upgradePlan)} &amp; Premium
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
