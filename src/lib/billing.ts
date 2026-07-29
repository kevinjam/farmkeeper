export type PlanId = 'free' | 'farmer' | 'premium';
export type PaidPlanId = 'farmer' | 'premium';
export type SubscriptionStatusValue = 'active' | 'expired' | 'canceled' | 'trial';

export interface Plan {
  name: string;
  price: string;
  priceAmount?: number;
  priceYearly?: string | null;
  priceYearlyAmount?: number | null;
  period: string;
  livestockLimit: number | null;
  features: string[];
  description: string;
  popular?: boolean;
  limitations?: string[];
  trialDays?: number;
  trialLabel?: string;
}

export interface Plans {
  free: Plan;
  farmer: Plan;
  premium: Plan;
}

export interface BillingMeta {
  countryCode: string;
  region: 'uganda' | 'international';
  currency: string;
  paymentMethods: string[];
  paymentProvider: 'flutterwave' | 'paddle';
  supportsYearly?: boolean;
}

export interface SubscriptionStatus {
  plan: PlanId;
  /** Raw plan from API (may be legacy `trial`) */
  rawPlan?: string;
  subscriptionStatus: SubscriptionStatusValue;
  livestockLimit: number | null;
  features: string[];
  trialStartDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  nextBillingDate?: string;
  lastPaymentDate?: string;
  autoRenew: boolean;
  daysLeft: number;
  isExpired: boolean;
  isTrialExpired: boolean;
  isFarmerTrial: boolean;
  trialEndDate?: string;
  unlockAllFeatures?: boolean;
}

export interface PaymentRecord {
  _id: string;
  plan: PaidPlanId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  provider?: string;
  reference?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  invoiceSentAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type BillingTab = 'overview' | 'plans' | 'history';

export const FEATURE_LABELS: Record<string, string> = {
  livestock: 'Livestock management',
  crops: 'Crop management',
  finances: 'Financial tracking',
  feed_management: 'Feed management',
  eggs_sales: 'Eggs & sales',
  weather: 'Weather forecast',
  analytics: 'Advanced analytics',
  billing: 'Billing & invoices',
  settings: 'Farm settings',
};

export function normalizePlanId(plan: string): PlanId {
  if (plan === 'trial' || plan === 'farmer') return 'farmer';
  if (plan === 'premium') return 'premium';
  return 'free';
}

export function getPlanLabel(plan: PlanId | string): string {
  switch (normalizePlanId(plan)) {
    case 'free':
      return 'Free';
    case 'farmer':
      return 'Farmer';
    case 'premium':
      return 'Premium';
    default:
      return plan;
  }
}

export function getStatusBadge(
  plan: PlanId | string,
  status: SubscriptionStatusValue,
  isExpired: boolean,
  isFarmerTrial?: boolean
) {
  const normalized = normalizePlanId(plan);
  if (normalized === 'farmer' && isFarmerTrial) {
    return isExpired
      ? { label: 'Farmer trial ended', tone: 'warning' as const }
      : { label: 'Farmer trial', tone: 'info' as const };
  }
  if (normalized === 'farmer') {
    if (status === 'canceled') return { label: 'Canceled', tone: 'neutral' as const };
    if (isExpired) return { label: 'Expired', tone: 'warning' as const };
    return { label: 'Active', tone: 'success' as const };
  }
  if (normalized === 'premium') {
    if (status === 'canceled') return { label: 'Canceled', tone: 'neutral' as const };
    if (isExpired) return { label: 'Expired', tone: 'warning' as const };
    return { label: 'Active', tone: 'success' as const };
  }
  return { label: 'Free plan', tone: 'neutral' as const };
}

export function formatBillingDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatAmount(amount: number, currency = 'UGX') {
  return `${currency} ${amount.toLocaleString()}`;
}

export function normalizeSubscriptionStatus(data: Record<string, unknown>): SubscriptionStatus {
  const rawPlan = String(data.plan || 'free');
  const plan = normalizePlanId(rawPlan);
  const subscriptionStatus = (data.subscriptionStatus as SubscriptionStatusValue) || 'trial';
  const isExpired = Boolean(data.isExpired);
  const isFarmerTrial = Boolean(
    data.isFarmerTrial ?? (plan === 'farmer' && (rawPlan === 'trial' || subscriptionStatus === 'trial'))
  );

  return {
    plan,
    rawPlan,
    subscriptionStatus,
    livestockLimit: (data.livestockLimit as number | null) ?? null,
    features: (data.features as string[]) || [],
    trialStartDate: data.trialStartDate as string | undefined,
    subscriptionStartDate: data.subscriptionStartDate as string | undefined,
    subscriptionEndDate: data.subscriptionEndDate as string | undefined,
    nextBillingDate: data.nextBillingDate as string | undefined,
    lastPaymentDate: data.lastPaymentDate as string | undefined,
    autoRenew: Boolean(data.autoRenew),
    daysLeft: Number(data.daysLeft) || 0,
    isExpired,
    isTrialExpired: Boolean(data.isTrialExpired ?? (isFarmerTrial && isExpired)),
    isFarmerTrial,
    trialEndDate: data.trialEndDate as string | undefined,
    unlockAllFeatures: Boolean(data.unlockAllFeatures),
  };
}

/** Suggested paid upgrade for current plan state */
export function getUpgradeTarget(status: SubscriptionStatus): PaidPlanId | null {
  if (status.plan === 'premium' && status.subscriptionStatus === 'active' && !status.isExpired) {
    return null;
  }
  if (status.plan === 'farmer' && !status.isFarmerTrial && status.subscriptionStatus === 'active' && !status.isExpired) {
    return 'premium';
  }
  return 'farmer';
}
