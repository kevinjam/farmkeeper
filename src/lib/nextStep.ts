import { formatProduceAmount, harvestCropName, type HarvestRecord, type HarvestUnitSummary } from './harvest';
import { buildSetupSteps, type SetupCounts } from './setupGuide';

export type NextStepAccess = {
  canUseFinances: boolean;
  canUseFeed: boolean;
  canUseEggs: boolean;
};

export type NextStepInput = {
  counts: SetupCounts;
  remaining?: Pick<HarvestUnitSummary, 'unit' | 'remaining'>[];
  cropName?: string;
  access: NextStepAccess;
};

export type NextStepRecommendation = {
  id: string;
  title: string;
  detail?: string;
  action: string;
  href: string;
};

function leftoverRows(remaining: NextStepInput['remaining'] = []) {
  return remaining.filter((row) => {
    const amount = Number(row.remaining);
    return Number.isFinite(amount) && amount > 0;
  });
}

export function safeCropName(value?: string | null) {
  const name = String(value || '').trim();
  if (!name || name === 'undefined' || name === 'null') return '';
  return name;
}

export function formatUnsoldHeadline(
  remaining: NextStepInput['remaining'] = [],
  cropName?: string
) {
  const leftover = leftoverRows(remaining);
  const amount = leftover.map((row) => formatProduceAmount(row.remaining, row.unit)).join(' · ');
  if (!amount) return '';
  const crop = safeCropName(cropName);
  if (crop) return `You have ${amount} of ${crop} available.`;
  return `You have ${amount} available.`;
}

export function pickUnsoldCropName(recent: HarvestRecord[] = []) {
  const withStock = recent.find((row) => Number(row.remainingQuantity) > 0);
  return harvestCropName(withStock || recent[0] || {});
}

export function isOnboardingComplete(counts: SetupCounts, access: NextStepAccess) {
  const steps = buildSetupSteps(counts, access);
  return steps.length > 0 && steps.every((step) => step.done);
}

function addCrop(): NextStepRecommendation {
  return {
    id: 'add-crop',
    title: 'Add your first crop.',
    action: 'Add crop →',
    href: '/dashboard/crops/add',
  };
}

function firstExpense(): NextStepRecommendation {
  return {
    id: 'add-expense',
    title: 'Record your first farm expense.',
    action: 'Add expense →',
    href: '/dashboard/finances/expense',
  };
}

function firstHarvest(): NextStepRecommendation {
  return {
    id: 'add-harvest',
    title: 'Record your first harvest.',
    action: 'Record harvest →',
    href: '/dashboard/harvests/add',
  };
}

function recordSale(title = 'Record a sale.'): NextStepRecommendation {
  return {
    id: title.startsWith('You have') ? 'sell-produce' : 'record-sale',
    title,
    action: 'Record a sale →',
    href: '/dashboard/harvests/sales/add',
  };
}

function expensesForProfit(): NextStepRecommendation {
  return {
    id: 'add-expenses-profit',
    title: 'Add your farm expenses to understand profitability.',
    action: 'Add expense →',
    href: '/dashboard/finances/expense',
  };
}

function reviewProfit(): NextStepRecommendation {
  return {
    id: 'review-profit',
    title: 'Review your farm profitability.',
    action: 'View profitability →',
    href: '/dashboard/profitability',
  };
}

function unsoldStep(input: NextStepInput): NextStepRecommendation | null {
  const headline = formatUnsoldHeadline(input.remaining, input.cropName);
  if (headline) return recordSale(headline);
  if (input.counts.harvests > 0 && input.counts.sales === 0) return recordSale();
  return null;
}

function livestockOngoing(counts: SetupCounts, access: NextStepAccess): NextStepRecommendation {
  if (access.canUseFeed && counts.feed === 0) {
    return {
      id: 'record-feed',
      title: 'Record feed for your livestock.',
      action: 'Add feed →',
      href: '/dashboard/feed/add',
    };
  }
  if (access.canUseEggs && counts.eggs === 0) {
    return {
      id: 'record-production',
      title: 'Record your livestock production.',
      action: 'Log eggs →',
      href: '/dashboard/eggs/record',
    };
  }
  if (access.canUseFinances && counts.expenses === 0) {
    return firstExpense();
  }
  if (access.canUseFinances && counts.expenses > 0) {
    return reviewProfit();
  }
  return {
    id: 'add-livestock',
    title: 'Add another animal to your herd.',
    action: 'Add livestock →',
    href: '/dashboard/livestock/add',
  };
}

function cropOngoing(input: NextStepInput): NextStepRecommendation {
  const sell = unsoldStep(input);
  if (sell) return sell;
  if (input.access.canUseFinances && input.counts.sales > 0 && input.counts.expenses > 0) {
    return reviewProfit();
  }
  if (input.counts.crops > 0) {
    return {
      id: 'add-harvest',
      title: 'Record another harvest.',
      action: 'Record harvest →',
      href: '/dashboard/harvests/add',
    };
  }
  return addCrop();
}

/** One primary next action from live farm records. No AI. */
export function recommendNextAction(input: NextStepInput): NextStepRecommendation {
  const { counts, access } = input;
  const livestockOnly = counts.livestock > 0 && counts.crops === 0;
  const onboardingComplete = isOnboardingComplete(counts, access);

  if (livestockOnly) {
    return livestockOngoing(counts, access);
  }

  if (counts.crops === 0) {
    return addCrop();
  }

  if (onboardingComplete) {
    return cropOngoing(input);
  }

  if (access.canUseFinances && counts.expenses === 0 && counts.harvests === 0 && counts.sales === 0) {
    return firstExpense();
  }

  if (counts.harvests === 0) {
    return firstHarvest();
  }

  const sell = unsoldStep(input);
  if (sell) return sell;

  if (access.canUseFinances && counts.sales > 0 && counts.expenses === 0) {
    return expensesForProfit();
  }

  if (access.canUseFinances && counts.sales > 0 && counts.expenses > 0) {
    return reviewProfit();
  }

  return cropOngoing(input);
}

const QUICK_ACTION_ORDER: Record<string, string[]> = {
  'add-crop': ['add-crop', 'add-expense', 'record-sale', 'add-livestock', 'record-eggs'],
  'add-expense': ['add-expense', 'record-sale', 'add-livestock', 'record-eggs'],
  'add-expenses-profit': ['add-expense', 'record-sale', 'add-livestock', 'record-eggs'],
  'add-harvest': ['add-harvest', 'record-sale', 'add-expense', 'add-livestock', 'record-eggs'],
  'sell-produce': ['record-sale', 'add-expense', 'add-livestock', 'record-eggs'],
  'record-sale': ['record-sale', 'add-expense', 'add-livestock', 'record-eggs'],
  'review-profit': ['add-expense', 'record-sale', 'add-livestock', 'record-eggs'],
  'record-feed': ['add-livestock', 'record-eggs', 'add-expense', 'record-sale'],
  'record-production': ['record-eggs', 'add-livestock', 'add-expense', 'record-sale'],
  'add-livestock': ['add-livestock', 'record-eggs', 'add-expense', 'record-sale'],
};

export function sortQuickActions<T extends { key: string }>(
  items: T[],
  recommendationId?: string
): T[] {
  const order = QUICK_ACTION_ORDER[recommendationId || ''] || [
    'add-livestock',
    'record-eggs',
    'add-expense',
    'record-sale',
  ];
  return [...items].sort((a, b) => {
    const ai = order.indexOf(a.key);
    const bi = order.indexOf(b.key);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
