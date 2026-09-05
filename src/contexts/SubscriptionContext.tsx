'use client';

import { createContext, useContext, ReactNode } from 'react';
import { PlanId } from '@/lib/billing';
import { BASELINE_FEATURES } from '@/lib/features';

export interface SubscriptionContextValue {
  plan: PlanId;
  features: string[];
  unlockAllFeatures: boolean;
  livestockLimit: number | null;
  daysLeft: number;
  isFarmerTrial: boolean;
  isTrialExpired: boolean;
  loaded: boolean;
}

const defaultValue: SubscriptionContextValue = {
  plan: 'free',
  features: [...BASELINE_FEATURES],
  unlockAllFeatures: false,
  livestockLimit: null,
  daysLeft: 0,
  isFarmerTrial: false,
  isTrialExpired: false,
  loaded: false,
};

const SubscriptionContext = createContext<SubscriptionContextValue>(defaultValue);

export function SubscriptionProvider({
  value,
  children,
}: {
  value: SubscriptionContextValue;
  children: ReactNode;
}) {
  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  return useContext(SubscriptionContext);
}
