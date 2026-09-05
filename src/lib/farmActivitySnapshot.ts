import { apiClient } from './api';
import type { HarvestSummary } from './harvest';
import { pickUnsoldCropName, type NextStepAccess } from './nextStep';
import type { SetupCounts } from './setupGuide';

export type FarmActivitySnapshot = {
  counts: SetupCounts;
  remaining: { unit: string; remaining: number }[];
  cropName: string;
  access: NextStepAccess;
  failed: boolean;
};

export function emptySetupCounts(): SetupCounts {
  return { crops: 0, harvests: 0, sales: 0, expenses: 0, livestock: 0, feed: 0, eggs: 0 };
}

let inflight: { key: string; promise: Promise<FarmActivitySnapshot> } | null = null;

/** One farm snapshot for setup + next-step. Concurrent callers share the same request. */
export function fetchFarmActivitySnapshot(farmId: string, access: NextStepAccess) {
  const key = `${farmId}:${Number(access.canUseFinances)}:${Number(access.canUseFeed)}:${Number(access.canUseEggs)}`;
  if (inflight?.key === key) return inflight.promise;

  const promise = loadFarmActivitySnapshot(farmId, access).finally(() => {
    if (inflight?.promise === promise) inflight = null;
  });
  inflight = { key, promise };
  return promise;
}

async function loadFarmActivitySnapshot(
  farmId: string,
  access: NextStepAccess
): Promise<FarmActivitySnapshot> {
  const counts = emptySetupCounts();
  const [livestock, crops, harvests] = await Promise.all([
    apiClient.getTotalLivestock(farmId),
    apiClient.getTotalCrops(farmId),
    apiClient.getHarvestSummary(farmId),
  ]);

  if (!livestock.success || !crops.success || !harvests.success) {
    return { counts, remaining: [], cropName: '', access, failed: true };
  }

  counts.livestock = livestock.data?.totalLivestock || 0;
  counts.crops = crops.data?.totalCrops || 0;
  const summary = (harvests.data || {}) as HarvestSummary;
  counts.harvests = summary.harvestCount || 0;
  counts.sales = summary.saleCount || 0;
  const remaining = Array.isArray(summary.byUnit) ? summary.byUnit : [];
  const cropName = pickUnsoldCropName(summary.recent || []);

  const extras: Promise<void>[] = [];
  if (access.canUseFinances) {
    extras.push(
      apiClient.getFinancialSummary(farmId).then((response) => {
        if (response.success) counts.expenses = response.data?.totalCount || 0;
      })
    );
  }
  if (access.canUseFeed) {
    extras.push(
      apiClient.getFeedstockSummary(farmId).then((response) => {
        if (response.success) counts.feed = response.data?.totalItems || 0;
      })
    );
  }
  if (access.canUseEggs) {
    extras.push(
      apiClient.getEggCollections(farmId).then((response) => {
        if (!response.success) return;
        const rows = Array.isArray(response.data) ? response.data : [];
        counts.eggs = rows.length;
      })
    );
  }
  await Promise.all(extras);

  return { counts, remaining, cropName, access, failed: false };
}
