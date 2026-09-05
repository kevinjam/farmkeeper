export type SetupCounts = {
  crops: number;
  harvests: number;
  sales: number;
  expenses: number;
  livestock: number;
  feed: number;
  eggs: number;
};

export type SetupStep = {
  id: string;
  title: string;
  done: boolean;
  href: string;
  action: string;
};

export const SETUP_GUIDE_DISMISS_PREFIX = 'setup-guide-dismissed';

export function setupGuideDismissKey(userId: string, farmId: string) {
  return `${SETUP_GUIDE_DISMISS_PREFIX}:${userId}:${farmId}`;
}

export function isSetupGuideDismissed(userId: string, farmId: string) {
  if (typeof window === 'undefined' || !userId || !farmId) return false;
  try {
    return localStorage.getItem(setupGuideDismissKey(userId, farmId)) === '1';
  } catch {
    return false;
  }
}

export function dismissSetupGuide(userId: string, farmId: string) {
  if (typeof window === 'undefined' || !userId || !farmId) return;
  try {
    localStorage.setItem(setupGuideDismissKey(userId, farmId), '1');
  } catch {
    // ignore quota / private mode
  }
}

/** Farms that already have real operating history should not see beginner setup. */
export function isEstablishedFarm(counts: SetupCounts): boolean {
  const cropLoop = counts.crops > 0 && counts.harvests > 0 && counts.sales > 0 && counts.expenses > 0;
  const livestockLoop =
    counts.livestock > 0 && counts.expenses > 0 && (counts.feed > 0 || counts.eggs > 0);
  const volume =
    counts.crops >= 3 ||
    counts.livestock >= 3 ||
    counts.harvests >= 2 ||
    counts.sales >= 2 ||
    counts.expenses >= 3;
  return cropLoop || livestockLoop || volume;
}

export function buildSetupSteps(
  counts: SetupCounts,
  options: { canUseFinances: boolean; canUseFeed: boolean; canUseEggs: boolean }
): SetupStep[] {
  const cropFarm =
    counts.crops > 0 || counts.harvests > 0 || counts.sales > 0 || counts.livestock === 0;
  const livestockFarm = counts.livestock > 0;
  const steps: SetupStep[] = [];

  if (cropFarm) {
    steps.push({
      id: 'add-crop',
      title: 'Add first crop',
      done: counts.crops > 0,
      href: '/dashboard/crops/add',
      action: 'Add crop',
    });
  }

  if (livestockFarm) {
    steps.push({
      id: 'add-livestock',
      title: 'Add livestock',
      done: counts.livestock > 0,
      href: '/dashboard/livestock/add',
      action: 'Add livestock',
    });
  }

  if (livestockFarm && options.canUseFeed) {
    steps.push({
      id: 'record-feed',
      title: 'Record feed',
      done: counts.feed > 0,
      href: '/dashboard/feed/add',
      action: 'Add feed',
    });
  }

  if (options.canUseFinances) {
    steps.push({
      id: 'record-expense',
      title: 'Record first expense',
      done: counts.expenses > 0,
      href: '/dashboard/finances/expense',
      action: 'Add expense',
    });
  }

  if (cropFarm) {
    steps.push({
      id: 'record-harvest',
      title: 'Record first harvest',
      done: counts.harvests > 0,
      href: '/dashboard/harvests/add',
      action: 'Record harvest',
    });
    steps.push({
      id: 'record-sale',
      title: 'Record first sale',
      done: counts.sales > 0,
      href: '/dashboard/harvests/sales/add',
      action: 'Record sale',
    });
  }

  if (livestockFarm && options.canUseEggs) {
    steps.push({
      id: 'record-production',
      title: 'Record production',
      done: counts.eggs > 0,
      href: '/dashboard/eggs/record',
      action: 'Log eggs',
    });
  }

  return steps;
}

export function setupProgress(steps: SetupStep[]) {
  const completed = steps.filter((step) => step.done).length;
  return {
    completed,
    total: steps.length,
    label: `${completed} of ${steps.length} completed`,
    percent: steps.length ? Math.round((completed / steps.length) * 100) : 0,
  };
}

export function shouldShowSetupGuide(counts: SetupCounts, steps: SetupStep[], dismissed: boolean) {
  if (dismissed) return false;
  if (!steps.length) return false;
  if (steps.every((step) => step.done)) return false;
  if (isEstablishedFarm(counts)) return false;
  return true;
}
