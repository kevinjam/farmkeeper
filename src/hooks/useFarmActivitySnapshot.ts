'use client';

import { useEffect, useState } from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { hasFeatureAccess } from '@/lib/features';
import {
  emptySetupCounts,
  fetchFarmActivitySnapshot,
  type FarmActivitySnapshot,
} from '@/lib/farmActivitySnapshot';
import type { NextStepAccess } from '@/lib/nextStep';

function accessFromFeatures(
  features: string[],
  unlockAllFeatures: boolean
): NextStepAccess {
  return {
    canUseFinances: hasFeatureAccess(features, 'finances', unlockAllFeatures),
    canUseFeed: hasFeatureAccess(features, 'feed_management', unlockAllFeatures),
    canUseEggs: hasFeatureAccess(features, 'eggs_sales', unlockAllFeatures),
  };
}

export function useFarmActivitySnapshot(farmId: string) {
  const { features, unlockAllFeatures, loaded } = useSubscriptionContext();
  const [snapshot, setSnapshot] = useState<FarmActivitySnapshot>({
    counts: emptySetupCounts(),
    remaining: [],
    cropName: '',
    access: { canUseFinances: false, canUseFeed: false, canUseEggs: false },
    failed: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loaded || !farmId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const access = accessFromFeatures(features, unlockAllFeatures);
      const next = await fetchFarmActivitySnapshot(farmId, access);
      if (cancelled) return;
      setSnapshot(next);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [farmId, features, loaded, unlockAllFeatures]);

  return { snapshot, loading, ready: loaded && !loading };
}
