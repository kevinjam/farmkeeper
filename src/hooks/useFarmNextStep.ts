'use client';

import { useMemo } from 'react';
import { useFarmActivitySnapshot } from '@/hooks/useFarmActivitySnapshot';
import { recommendNextAction, type NextStepRecommendation } from '@/lib/nextStep';

export function useFarmNextStep(farmId: string) {
  const { snapshot, loading } = useFarmActivitySnapshot(farmId);

  const recommendation = useMemo<NextStepRecommendation | null>(() => {
    if (loading || snapshot.failed) return null;
    return recommendNextAction({
      counts: snapshot.counts,
      remaining: snapshot.remaining,
      cropName: snapshot.cropName,
      access: snapshot.access,
    });
  }, [loading, snapshot]);

  return { recommendation, loading };
}
