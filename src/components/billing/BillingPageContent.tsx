'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  Crown,
  Download,
  History,
  LayoutGrid,
  Loader2,
  Shield,
  Smartphone,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentModal from '@/components/billing/PaymentModal';
import { useSubscription } from '@/hooks/useSubscription';
import { apiClient } from '@/lib/api';
import { getCountryByCode } from '@/lib/countries';
import {
  BillingTab,
  FEATURE_LABELS,
  formatAmount,
  formatBillingDate,
  getPlanLabel,
  getStatusBadge,
  getUpgradeTarget,
  PaidPlanId,
  PlanId,
} from '@/lib/billing';

type BillingCycle = 'month' | 'year';

const TABS: { id: BillingTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'plans', label: 'Plans', icon: Sparkles },
  { id: 'history', label: 'Billing history', icon: History },
];

function StatusPill({ tone, label }: { tone: 'success' | 'warning' | 'info' | 'neutral'; label: string }) {
  const styles = {
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>{label}</span>;
}

export default function BillingPageContent({ farmId }: { farmId: string }) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as BillingTab) || 'overview';
  const [tab, setTab] = useState<BillingTab>(initialTab);
  const [showPayment, setShowPayment] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlanId>('farmer');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('month');
  const [canceling, setCanceling] = useState(false);
  const [farmCountry, setFarmCountry] = useState<string | undefined>();
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient.getFarmSettings(farmId).then((res) => {
      if (!cancelled && res.success) {
        setFarmCountry(res.data?.location?.country);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [farmId]);

  const {
    status,
    plans,
    billingMeta,
    history,
    loading,
    historyLoading,
    error,
    refreshAll,
    fetchHistory,
    cancelSubscription,
    setError,
    countryCode,
  } = useSubscription(farmCountry);

  const handleDownloadInvoice = async (reference?: string) => {
    if (!reference) return;
    setDownloadingRef(reference);
    setError('');
    try {
      const result = await apiClient.downloadInvoice(reference);
      if (!result.success || !result.blob) {
        throw new Error(result.error || 'Could not download invoice');
      }
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download invoice');
    } finally {
      setDownloadingRef(null);
    }
  };

  const paymentMethodsDisplay = useMemo(() => {
    if (billingMeta?.region === 'international') {
      return [
        { title: 'Card (Paddle)', sub: 'Visa, Mastercard, Amex' },
        { title: 'Secure checkout', sub: 'Encrypted by Paddle' },
        { title: 'Global billing', sub: getCountryByCode(countryCode).name },
      ];
    }
    return [
      { title: 'MTN Mobile Money', sub: '*165*99#' },
      { title: 'Airtel Money', sub: '*185*99#' },
      { title: 'Card (Paddle)', sub: 'Visa, Mastercard' },
    ];
  }, [billingMeta?.region, countryCode]);

  useEffect(() => {
    const requested = searchParams.get('tab') as BillingTab | null;
    if (requested && TABS.some((t) => t.id === requested)) {
      setTab(requested);
    }
  }, [searchParams]);

  useEffect(() => {
    if (tab === 'history') {
      fetchHistory();
    }
  }, [tab, fetchHistory]);

  const badge = useMemo(() => {
    if (!status) return null;
    return getStatusBadge(status.plan, status.subscriptionStatus, status.isExpired, status.isFarmerTrial);
  }, [status]);

  const upgradeTarget = status ? getUpgradeTarget(status) : null;

  const openCheckout = (plan: PaidPlanId) => {
    setCheckoutPlan(plan);
    setShowPayment(true);
  };

  const canCancel =
    status &&
    (status.plan === 'premium' || (status.plan === 'farmer' && !status.isFarmerTrial)) &&
    status.subscriptionStatus === 'active';

  const handleCancel = async () => {
    if (!confirm('Cancel your paid plan? You will move to the Free plan immediately.')) return;
    setCanceling(true);
    try {
      await cancelSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setCanceling(false);
    }
  };

  const handlePaymentSuccess = async () => {
    localStorage.setItem('refreshSubscription', 'true');
    await refreshAll();
    setTab('overview');
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 font-medium text-red-600">{error}</p>
        <Button className="mt-6" onClick={() => refreshAll()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:mx-auto md:max-w-6xl md:px-6 md:py-8 lg:px-8">
      {/* Hero */}
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-2xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80">
        <div className="max-md:bg-gradient-to-br max-md:from-emerald-500/12 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-emerald-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">Plan &amp; billing</h1>
                <p className="mt-0.5 text-[13px] text-gray-600 dark:text-gray-300 md:text-base">
                  Manage your subscription, payments, and invoices in one place.
                </p>
              </div>
            </div>
            {status && badge && (
              <div className="flex items-center gap-2 md:flex-col md:items-end">
                <StatusPill tone={badge.tone} label={badge.label} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getPlanLabel(status.plan)} plan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-3 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 md:mx-0 md:mt-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-0 z-10 mt-4 border-b border-gray-200 bg-gray-50/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 max-md:rounded-t-2xl max-md:border max-md:border-b-0 md:mt-6 md:rounded-t-2xl md:border md:border-b-0 md:bg-white md:dark:bg-gray-800">
        <nav className="flex gap-1 overflow-x-auto p-2 scrollbar-hide" aria-label="Billing sections">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="max-md:hidden">{item.label}</span>
                <span className="md:hidden">{item.id === 'history' ? 'History' : item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 max-md:rounded-b-2xl max-md:border max-md:border-t-0 max-md:shadow-md dark:max-md:border-gray-700/80 md:rounded-b-2xl md:border md:border-t-0 md:p-6 md:shadow-lg">
        {/* Overview */}
        {tab === 'overview' && status && plans && (
          <div className="space-y-4 p-4 md:space-y-6 md:p-0">
            {(status.isTrialExpired ||
              (status.isFarmerTrial && status.daysLeft <= 7) ||
              (status.plan === 'free' && status.isTrialExpired)) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  {status.isTrialExpired || status.plan === 'free'
                    ? 'Your free Farmer trial has ended'
                    : `${status.daysLeft} day${status.daysLeft === 1 ? '' : 's'} left on Farmer (free trial)`}
                </p>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-300/90">
                  Subscribe to Farmer (UGX 3,500/mo) or Premium (UGX 15,000/mo) to keep your records and tools.
                </p>
                {upgradeTarget && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    {(upgradeTarget === 'farmer' || status.plan === 'free') && (
                      <Button className="min-h-11 rounded-xl" onClick={() => openCheckout('farmer')}>
                        Farmer — UGX 3,500/mo
                      </Button>
                    )}
                    <Button
                      variant={upgradeTarget === 'premium' ? 'default' : 'outline'}
                      className="min-h-11 rounded-xl"
                      onClick={() => openCheckout('premium')}
                    >
                      Premium — UGX 15,000/mo
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="max-md:rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="h-5 w-5 text-primary-600" />
                    Current plan
                  </CardTitle>
                  <CardDescription>Your active subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans[status.plan].name}</p>
                      <p className="text-sm text-gray-500">{plans[status.plan].description}</p>
                    </div>
                    <p className="text-lg font-bold text-primary-600">
                      {plans[status.plan].price}
                      <span className="text-sm font-normal text-gray-500"> /{plans[status.plan].period}</span>
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    {status.isFarmerTrial && (
                      <>
                        <div>
                          <dt className="text-gray-500">Free trial ends</dt>
                          <dd className="font-medium">{formatBillingDate(status.trialEndDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Days left</dt>
                          <dd className="font-medium">{status.daysLeft}</dd>
                        </div>
                      </>
                    )}
                    {(status.plan === 'farmer' || status.plan === 'premium') && !status.isFarmerTrial && (
                      <>
                        <div>
                          <dt className="text-gray-500">Renews</dt>
                          <dd className="font-medium">{formatBillingDate(status.nextBillingDate || status.subscriptionEndDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Auto-renew</dt>
                          <dd className="font-medium">{status.autoRenew ? 'On' : 'Off'}</dd>
                        </div>
                      </>
                    )}
                    <div>
                      <dt className="text-gray-500">Livestock limit</dt>
                      <dd className="font-medium">{status.livestockLimit ?? 'Unlimited'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Last payment</dt>
                      <dd className="font-medium">{formatBillingDate(status.lastPaymentDate)}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {upgradeTarget === 'farmer' && (
                      <Button className="min-h-11 flex-1 rounded-xl" onClick={() => openCheckout('farmer')}>
                        Subscribe — Farmer UGX 3,500
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {upgradeTarget === 'premium' && (
                      <Button className="min-h-11 flex-1 rounded-xl" onClick={() => openCheckout('premium')}>
                        Upgrade — Premium UGX 15,000
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant="outline"
                        className="min-h-11 flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        disabled={canceling}
                        onClick={handleCancel}
                      >
                        {canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel subscription'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="max-md:rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-primary-600" />
                    Included features
                  </CardTitle>
                  <CardDescription>What your plan unlocks today</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {status.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        {FEATURE_LABELS[feature] || feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="max-md:rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5 text-primary-600" />
                  Payment methods
                </CardTitle>
                <CardDescription>
                  {billingMeta?.region === 'international'
                    ? 'International card payments via Paddle'
                    : 'Uganda mobile money + card via Flutterwave & Paddle'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {paymentMethodsDisplay.map((method) => (
                  <div key={method.title} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">{method.title}</p>
                    <p className="text-sm text-gray-500">{method.sub}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans */}
        {tab === 'plans' && status && plans && (
          <div className="space-y-4 p-4 md:space-y-6 md:p-0">
            {/* Current plan summary */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      Your current plan
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {plans[status.plan].name}
                      {status.isFarmerTrial && (
                        <span className="ml-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          (free trial)
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                      {status.isFarmerTrial
                        ? `${status.daysLeft} day${status.daysLeft === 1 ? '' : 's'} left · then ${plans.farmer.price}/${plans.farmer.period}`
                        : status.plan === 'free'
                          ? plans.free.description
                          : `${plans[status.plan].price}/${plans[status.plan].period}`}
                    </p>
                  </div>
                </div>
                {badge && <StatusPill tone={badge.tone} label={badge.label} />}
              </div>
            </div>

            <div className="flex justify-center">
              <div
                role="group"
                aria-label="Billing period"
                className="inline-flex rounded-full border border-gray-200 bg-gray-100/80 p-1 dark:border-gray-700 dark:bg-gray-800/80"
              >
                <button
                  type="button"
                  onClick={() => setBillingCycle('month')}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    billingCycle === 'month'
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('year')}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    billingCycle === 'year'
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {(['free', 'farmer', 'premium'] as PlanId[]).map((planId) => {
              const plan = plans[planId];
              const isFree = planId === 'free';
              const displayPrice =
                !isFree && billingCycle === 'year' && plan.priceYearly
                  ? plan.priceYearly
                  : plan.price;
              const displayPeriod = isFree
                ? plan.period
                : billingCycle === 'year'
                  ? 'year'
                  : plan.period;
              const periodShort = billingCycle === 'year' ? 'yr' : 'mo';
              const isCurrent = planId === status.plan;
              const isFarmerTrialCurrent = planId === 'farmer' && status.isFarmerTrial;
              return (
                <Card
                  key={planId}
                  className={`relative flex flex-col max-md:rounded-2xl ${
                    isCurrent
                      ? 'border-2 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
                      : plan.popular
                        ? 'border-2 border-primary-500 shadow-md'
                        : ''
                  }`}
                >
                  {isCurrent ? (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 hover:bg-emerald-600">
                      Your plan
                    </Badge>
                  ) : plan.popular ? (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600">Most popular</Badge>
                  ) : null}
                  <CardHeader className="text-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <p className="pt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {displayPrice}
                      <span className="text-base font-normal text-gray-500"> /{displayPeriod}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="mb-6 flex-1 space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {FEATURE_LABELS[feature] || feature}
                        </li>
                      ))}
                      {plan.limitations?.map((limit) => (
                        <li key={limit} className="flex items-center gap-2 text-sm text-gray-500">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          {limit}
                        </li>
                      ))}
                    </ul>
                    {planId === 'free' ? (
                      <Button className="min-h-11 w-full rounded-xl" variant="outline" disabled={isCurrent}>
                        {isCurrent ? 'Your current plan' : 'Default after trial ends'}
                      </Button>
                    ) : planId === 'farmer' ? (
                      <Button
                        className="min-h-11 w-full rounded-xl"
                        disabled={isCurrent && !isFarmerTrialCurrent}
                        variant={isCurrent && !isFarmerTrialCurrent ? 'outline' : 'default'}
                        onClick={() => (isFarmerTrialCurrent || !isCurrent) && openCheckout('farmer')}
                      >
                        {isFarmerTrialCurrent
                          ? `Subscribe — ${displayPrice}/${periodShort}`
                          : isCurrent
                            ? 'Your current plan'
                            : `Get Farmer — ${displayPrice}/${periodShort}`}
                      </Button>
                    ) : (
                      <Button
                        className="min-h-11 w-full rounded-xl"
                        disabled={isCurrent}
                        variant={isCurrent ? 'outline' : 'default'}
                        onClick={() => !isCurrent && openCheckout('premium')}
                      >
                        {isCurrent ? 'Your current plan' : `Get Premium — ${displayPrice}/${periodShort}`}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        )}

        {/* History */}
        {tab === 'history' && (
          <div className="p-4 md:p-0">
            {historyLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-gray-700">
                <History className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 font-medium text-gray-900 dark:text-white">No payments yet</p>
                <p className="mt-1 text-sm text-gray-500">Your invoices and receipts will appear here.</p>
                {upgradeTarget && (
                  <Button className="mt-4 rounded-xl" onClick={() => openCheckout(upgradeTarget)}>
                    Subscribe — {upgradeTarget === 'farmer' ? 'Farmer UGX 3,500' : 'Premium UGX 15,000'}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800 md:hidden">
                  {history.map((payment) => (
                    <li key={payment._id} className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {getPlanLabel(payment.plan)} · {formatAmount(payment.amount, payment.currency)}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatBillingDate(payment.createdAt)} · {payment.paymentMethod.replace('_', ' ')}
                          </p>
                          {payment.invoiceNumber && (
                            <p className="mt-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                              {payment.invoiceNumber}
                            </p>
                          )}
                          {payment.reference && (
                            <p className="mt-1 font-mono text-[10px] text-gray-400">{payment.reference}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusPill
                            tone={payment.status === 'completed' ? 'success' : payment.status === 'failed' ? 'warning' : 'neutral'}
                            label={payment.status}
                          />
                          {payment.status === 'completed' && payment.reference && (
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(payment.reference)}
                              disabled={downloadingRef === payment.reference}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 disabled:opacity-50"
                            >
                              {downloadingRef === payment.reference ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                              Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Plan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Invoice</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {history.map((payment) => (
                        <tr key={payment._id}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">{formatBillingDate(payment.createdAt)}</td>
                          <td className="px-4 py-3 text-sm capitalize">{payment.plan}</td>
                          <td className="px-4 py-3 text-sm font-medium">{formatAmount(payment.amount, payment.currency)}</td>
                          <td className="px-4 py-3 text-sm capitalize">{payment.paymentMethod.replace('_', ' ')}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">
                            {payment.invoiceNumber || payment.reference || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">{payment.status}</td>
                          <td className="px-4 py-3 text-right">
                            {payment.status === 'completed' && payment.reference ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5 rounded-lg"
                                disabled={downloadingRef === payment.reference}
                                onClick={() => handleDownloadInvoice(payment.reference)}
                              >
                                {downloadingRef === payment.reference ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                                PDF
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {plans && (
        <PaymentModal
          open={showPayment}
          plan={checkoutPlan}
          plans={plans}
          billingMeta={billingMeta}
          initialBillingCycle={billingCycle}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
