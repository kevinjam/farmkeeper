import type { ApiResponse } from '@/lib/api';

export const LIVESTOCK_LIMIT_CODE = 'LIVESTOCK_LIMIT_REACHED';

export type LivestockLimitDetails = {
  limit: number;
  currentCount: number;
};

export function parseLivestockLimitError(response: ApiResponse): LivestockLimitDetails | null {
  const payload = (response.data || {}) as {
    code?: string;
    currentCount?: number;
    limit?: number;
  };
  const isLimit =
    response.code === LIVESTOCK_LIMIT_CODE ||
    payload.code === LIVESTOCK_LIMIT_CODE ||
    /livestock limit/i.test(response.error || response.message || '');

  if (!isLimit) return null;

  const limit = Number(payload.limit);
  const currentCount = Number(payload.currentCount);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? limit : 5,
    currentCount: Number.isFinite(currentCount) && currentCount >= 0 ? currentCount : limit || 5,
  };
}

export function isAtLivestockLimit(
  count: number,
  livestockLimit: number | null | undefined,
  unlockAllFeatures?: boolean
): boolean {
  if (unlockAllFeatures) return false;
  if (livestockLimit == null) return false;
  return count >= livestockLimit;
}
