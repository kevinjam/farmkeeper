'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { DashboardGuard } from '@/components/auth/dashboard-guard';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { hasFeatureAccess } from '@/lib/features';
import UpcomingTasksCard from '@/components/dashboard/UpcomingTasksCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import FarmLocationPrompt from '@/components/dashboard/FarmLocationPrompt';
import PhonePrompt from '@/components/dashboard/PhonePrompt';

type StatVariant = 'livestock' | 'eggs' | 'profit' | 'feed';

const lockedCardChrome =
  'border-amber-300/70 bg-gradient-to-br from-amber-50/90 via-white to-white dark:border-amber-800/50 dark:from-amber-950/35 dark:via-gray-900 dark:to-gray-900/95';

const statVariantMobile: Record<
  StatVariant,
  { card: string; iconWrap: string; value: string; accentLine: string }
> = {
  livestock: {
    card: 'border-emerald-500/35 bg-gradient-to-br from-emerald-500/12 via-white to-white dark:from-emerald-500/20 dark:via-gray-900 dark:to-gray-900/95 shadow-emerald-900/10',
    iconWrap: 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
    value: 'text-emerald-950 dark:text-emerald-100',
    accentLine: 'bg-emerald-500/50',
  },
  eggs: {
    card: 'border-amber-400/40 bg-gradient-to-br from-amber-400/15 via-white to-white dark:from-amber-500/18 dark:via-gray-900 dark:to-gray-900/95 shadow-amber-900/10',
    iconWrap: 'bg-amber-400/25 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
    value: 'text-amber-950 dark:text-amber-50',
    accentLine: 'bg-amber-400/60',
  },
  profit: {
    card: 'border-sky-500/35 bg-gradient-to-br from-sky-500/12 via-white to-white dark:from-sky-500/18 dark:via-gray-900 dark:to-gray-900/95 shadow-sky-900/10',
    iconWrap: 'bg-sky-500/20 text-sky-800 dark:bg-sky-500/25 dark:text-sky-200',
    value: 'text-sky-950 dark:text-sky-50',
    accentLine: 'bg-sky-500/50',
  },
  feed: {
    card: 'border-orange-400/40 bg-gradient-to-br from-orange-400/14 via-white to-white dark:from-orange-500/16 dark:via-gray-900 dark:to-gray-900/95 shadow-orange-900/10',
    iconWrap: 'bg-orange-400/25 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200',
    value: 'text-orange-950 dark:text-orange-50',
    accentLine: 'bg-orange-400/55',
  },
};

// Dashboard Statistics Card — mobile: compact 2×2 tile; md+: original row layout
const StatCard = ({
  title,
  value,
  change,
  icon,
  positive = true,
  loading = false,
  variant = 'livestock',
  locked = false,
  href,
}: {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  positive?: boolean;
  loading?: boolean;
  variant?: StatVariant;
  locked?: boolean;
  href?: string;
}) => {
  const vm = statVariantMobile[variant];
  const trendClass = positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const showChange = Boolean(change) && !locked;
  const displayValue = locked ? '•••' : value;

  const mobileCard = (
    <div
      className={`md:hidden relative flex h-[7.25rem] select-none flex-col rounded-xl border p-3 shadow-md transition-transform duration-150 touch-manipulation active:scale-[0.97] ${
        locked ? lockedCardChrome : vm.card
      }`}
    >
      <div
        className={`pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl ${
          locked ? 'bg-amber-400/70' : vm.accentLine
        } opacity-80`}
      />
      {locked && (
        <span className="absolute right-2 top-2.5 inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
          <Lock className="h-2.5 w-2.5" aria-hidden />
          Locked
        </span>
      )}
      <div className="flex items-start justify-between gap-1">
        {loading && !locked ? (
          <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-700/80" />
        ) : (
          <p
            className={`text-[1.35rem] font-extrabold leading-none tracking-tight tabular-nums ${
              locked ? 'text-amber-900/50 dark:text-amber-200/40 blur-[1px]' : vm.value
            }`}
          >
            {displayValue}
          </p>
        )}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&_svg]:h-[1.15rem] [&_svg]:w-[1.15rem] ${
            locked
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
              : vm.iconWrap
          }`}
        >
          {locked ? <Lock className="h-4 w-4" /> : icon}
        </div>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <div className="mt-auto pt-1">
        {locked ? (
          <p className="text-[10px] font-medium text-amber-700 dark:text-amber-300">Upgrade to unlock</p>
        ) : showChange ? (
          loading ? (
            <div className="h-2.5 w-14 animate-pulse rounded bg-gray-200/70 dark:bg-gray-700/70" />
          ) : (
            <p className={`flex items-center gap-0.5 text-[10px] font-medium leading-none ${trendClass}`}>
              {positive ? (
                <span className="shrink-0" aria-hidden>
                  ↗
                </span>
              ) : (
                <span className="shrink-0" aria-hidden>
                  ↘
                </span>
              )}
              <span className="min-w-0 truncate">
                {change}{' '}
                <span className="font-normal text-gray-400 dark:text-gray-500">vs last mo.</span>
              </span>
            </p>
          )
        ) : null}
      </div>
    </div>
  );

  const desktopCard = (
    <div
      className={`hidden md:block relative rounded-lg shadow p-4 dark:border ${
        locked
          ? 'border border-amber-200/90 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/25'
          : 'bg-white dark:bg-gray-800 dark:border-gray-700/60'
      }`}
    >
      {locked && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
          <Lock className="h-3 w-3" aria-hidden />
          Locked
        </span>
      )}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          {loading && !locked ? (
            <div className="mt-2 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-20" />
          ) : (
            <h3
              className={`text-xl font-bold mt-1 tracking-tight ${
                locked
                  ? 'text-amber-900/45 dark:text-amber-200/40 blur-[1.5px] select-none'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {displayValue}
            </h3>
          )}
          {locked ? (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              Upgrade to unlock this metric
            </p>
          ) : showChange ? (
            <p className={`text-xs mt-2 flex items-center ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {positive ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0L13 9.414l-3.293 3.293A1 1 0 0112 13z" clipRule="evenodd" />
                </svg>
              )}
              {change} from last month
            </p>
          ) : null}
        </div>
        <div
          className={`p-2 rounded-lg shrink-0 ${
            locked
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
              : 'bg-primary-100 dark:bg-primary-900'
          }`}
        >
          {locked ? <Lock className="h-5 w-5" /> : icon}
        </div>
      </div>
    </div>
  );

  const content = (
    <>
      {mobileCard}
      {desktopCard}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="min-w-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
        title={locked ? 'Upgrade to unlock' : undefined}
      >
        {content}
      </Link>
    );
  }

  return <div className="min-w-0">{content}</div>;
};

// New Quick Link Card Component
const QuickLinkCard = ({
  href,
  icon,
  label,
  locked = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  locked?: boolean;
}) => (
  <Link
    href={href}
    title={locked ? 'Included on a higher plan — tap to upgrade' : undefined}
    className={`group relative flex min-h-[5rem] md:min-h-0 flex-col items-center justify-center gap-1 rounded-2xl border p-3 shadow-sm transition-all duration-200 active:scale-[0.97] md:rounded-lg md:p-4 ${
      locked
        ? 'border-amber-200/80 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20'
        : 'border-gray-100/80 bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700 md:border-0 md:bg-white md:shadow-md md:hover:bg-gray-50 md:dark:bg-gray-800'
    }`}
  >
    <div
      className={`rounded-2xl p-3 transition-transform duration-200 md:rounded-full ${
        locked
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
          : 'bg-primary-100 text-primary-600 group-hover:scale-105 dark:bg-primary-900 dark:text-primary-300'
      }`}
    >
      {icon}
    </div>
    <span
      className={`text-center text-xs font-semibold leading-tight md:text-sm md:font-medium ${
        locked ? 'text-amber-900/80 dark:text-amber-200/80' : 'text-gray-800 dark:text-gray-100'
      }`}
    >
      {label}
    </span>
    {locked && (
      <span className="absolute right-2 top-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        Locked
      </span>
    )}
  </Link>
);


function DashboardContent({ params }: { params: { farmId: string } }) {
  const { farmId: farmSlug } = params;
  const { farmPath } = useFarmPaths(farmSlug);
  const { features, unlockAllFeatures, loaded: subscriptionLoaded } = useSubscriptionContext();
  const canUse = (feature: string) => hasFeatureAccess(features, feature, unlockAllFeatures);

  if (!farmSlug) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-8 mx-auto max-w-xl text-center" role="alert">
        <span className="block sm:inline">Error: Farm ID is missing. Please log in again or select a farm from your account.</span>
      </div>
    );
  }
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalLivestock, setTotalLivestock] = useState<number>(0);
  const [eggsToday, setEggsToday] = useState<number>(0);
  const [financialAnalytics, setFinancialAnalytics] = useState<any>(null);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [feedStock, setFeedStock] = useState<any>(null);
  const [feedStockLoading, setFeedStockLoading] = useState(true);

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    if (amount === 0) return `${currency} 0`;
    
    if (amount >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const quickLinks = useMemo(
    () =>
      [
        {
          label: 'Add Livestock',
          href: farmPath('/dashboard/livestock/add'),
          feature: 'livestock',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
        },
        {
          label: 'Record Eggs',
          href: farmPath('/dashboard/eggs/record'),
          feature: 'eggs_sales',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
        {
          label: 'Add Expense',
          href: farmPath('/dashboard/finances/expense'),
          feature: 'finances',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          label: 'Record Sale',
          href: farmPath('/dashboard/finances/income'),
          feature: 'finances',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ),
        },
      ].map((link) => ({
        ...link,
        locked: !canUse(link.feature),
      })),
    [farmPath, features, unlockAllFeatures]
  );

  const displayStats = useMemo(() => {
    const eggsLocked = !canUse('eggs_sales');
    const financesLocked = !canUse('finances');
    const feedLocked = !canUse('feed_management');
    const profitGrowth = financialAnalytics?.growth?.profitGrowth;

    return [
      {
        title: 'Total Livestock',
        value: totalLivestock.toString(),
        positive: true,
        loading: statsLoading,
        variant: 'livestock' as StatVariant,
        locked: false,
        href: farmPath('/dashboard/livestock'),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        title: 'Eggs Today',
        value: eggsLocked ? '0' : eggsToday.toString(),
        positive: true,
        loading: !eggsLocked && statsLoading,
        variant: 'eggs' as StatVariant,
        locked: eggsLocked,
        href: farmPath('/dashboard/eggs'),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        ),
      },
      {
        title: 'Net Profit',
        value:
          financesLocked || !financialAnalytics
            ? 'UGX —'
            : formatCurrency(financialAnalytics.summary.netProfit, 'UGX'),
        change:
          !financesLocked && typeof profitGrowth === 'number'
            ? `${profitGrowth >= 0 ? '+' : ''}${profitGrowth.toFixed(1)}%`
            : undefined,
        positive: typeof profitGrowth === 'number' ? profitGrowth >= 0 : true,
        loading: !financesLocked && financialLoading,
        variant: 'profit' as StatVariant,
        locked: financesLocked,
        href: farmPath('/dashboard/finances'),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: 'Feed Stock',
        value: feedLocked || !feedStock ? '—%' : `${feedStock.stockPercentage}%`,
        positive: feedStock
          ? Array.isArray(feedStock.lowStockItems)
            ? feedStock.lowStockItems.length === 0
            : true
          : true,
        loading: !feedLocked && feedStockLoading,
        variant: 'feed' as StatVariant,
        locked: feedLocked,
        href: farmPath('/dashboard/feed'),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
      },
    ];
  }, [
    totalLivestock,
    eggsToday,
    statsLoading,
    financialAnalytics,
    financialLoading,
    feedStock,
    feedStockLoading,
    features,
    unlockAllFeatures,
    farmPath,
  ]);

  // Fetch feed stock data when plan includes feed management
  useEffect(() => {
    if (!subscriptionLoaded) return;

    if (!canUse('feed_management')) {
      setFeedStockLoading(false);
      return;
    }

    const fetchFeedStock = async () => {
      try {
        setFeedStockLoading(true);
        const response = await apiClient.getFeedstockSummary(farmSlug);
        if (response.success) {
          setFeedStock(response.data);
        } else {
          console.error('Failed to fetch feed stock data:', response.error);
        }
      } catch (error) {
        console.error('Error fetching feed stock data:', error);
      } finally {
        setFeedStockLoading(false);
      }
    };

    fetchFeedStock();
  }, [farmSlug, features, unlockAllFeatures, subscriptionLoaded]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);

      const livestockResponse = await apiClient.getTotalLivestock();
      if (livestockResponse.success) {
        setTotalLivestock(livestockResponse.data?.totalLivestock || 0);
      }

      if (canUse('eggs_sales')) {
        const eggsResponse = await apiClient.getTodayEggCollection();
        if (eggsResponse.success) {
          setEggsToday(eggsResponse.data?.eggsCollected || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

// Fetch financial analytics
const fetchFinancialAnalytics = async () => {
  try {
    setFinancialLoading(true);
    const response = await apiClient.getFinancialAnalytics();
    if (response.success) {
      setFinancialAnalytics(response.data);
    } else {
      console.error('Failed to fetch financial analytics:', response.error);
    }
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
  } finally {
    setFinancialLoading(false);
  }
};

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await apiClient.getAuthStatus();

        if (!response.success || !response.data?.isSignedUp) {
          router.replace('/auth/register');
          return;
        }

        const fetches: Promise<void>[] = [fetchDashboardStats()];
        if (canUse('finances')) {
          fetches.push(fetchFinancialAnalytics());
        } else {
          setFinancialLoading(false);
        }

        await Promise.all(fetches);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to verify user status. Please try again.');
        setIsLoading(false);
      }
    };

    if (!subscriptionLoaded) return;

    checkUserStatus();
  }, [router, features, unlockAllFeatures, subscriptionLoaded]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-md:space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-md:rounded-2xl shadow p-6 max-md:p-5 animate-pulse border border-transparent max-md:border-gray-100 dark:max-md:border-gray-800">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-lg w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 max-md:gap-3">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-[7.25rem] rounded-xl border border-gray-200/80 bg-gray-100/80 p-3 dark:border-gray-700 dark:bg-gray-800/80 md:h-auto md:rounded-lg md:p-4 animate-pulse"
            >
              <div className="hidden md:block h-4 bg-gray-300 dark:bg-gray-600 rounded-lg w-1/2 mb-2" />
              <div className="h-7 max-md:w-16 bg-gray-300 dark:bg-gray-600 rounded-lg md:h-8 md:w-1/3 mb-2 md:mb-2" />
              <div className="hidden md:block h-3 bg-gray-300 dark:bg-gray-600 rounded-lg w-2/5" />
              <div className="md:hidden mt-4 h-2.5 w-14 rounded bg-gray-300 dark:bg-gray-600" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-md:space-y-4">
      {/* Welcome message */}
      <div className="bg-white dark:bg-gray-800 rounded-lg max-md:rounded-2xl shadow max-md:shadow-md p-6 max-md:px-4 max-md:py-3.5 border border-transparent max-md:border-gray-100/90 dark:max-md:border-gray-700/80">
        <h2 className="text-2xl max-md:text-[1.2rem] font-bold text-gray-800 dark:text-white leading-snug">
          Welcome to your Farm Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 max-md:mt-1 text-sm max-md:text-[13px] leading-relaxed">
          Here&apos;s what&apos;s happening on your farm today.
        </p>
      </div>

      <FarmLocationPrompt farmId={farmSlug} />
      <PhonePrompt farmId={farmSlug} />

      {/* Stats section — mobile: 2×2 compact tiles; md+: responsive row */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {displayStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            positive={stat.positive}
            loading={stat.loading}
            icon={stat.icon}
            variant={stat.variant}
            locked={stat.locked}
            href={stat.href}
          />
        ))}
      </div>
      
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-md:gap-4">
        <UpcomingTasksCard farmId={farmSlug} limit={3} />

        {/* Quick Links */}
        <div className="space-y-6 max-md:space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-md:rounded-2xl shadow max-md:shadow-md border border-transparent max-md:border-gray-100/90 dark:max-md:border-gray-700/80 overflow-hidden">
            <div className="px-4 py-3 max-md:py-3.5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg max-md:text-base font-bold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            <div className="p-4 max-md:p-3 grid grid-cols-2 gap-3 max-md:gap-3">
              {quickLinks.map((link) => (
                <QuickLinkCard
                  key={link.label}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  locked={link.locked}
                />
              ))}
            </div>
          </div>
          <Link
            href={farmPath('/dashboard/weather')}
            className="flex items-center justify-between rounded-lg max-md:rounded-2xl border border-sky-200/80 bg-sky-50 px-4 py-3.5 text-sky-900 shadow-sm transition-colors hover:bg-sky-100 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-950/70"
          >
            <div>
              <p className="text-sm font-semibold">Farm weather</p>
              <p className="text-xs text-sky-800/80 dark:text-sky-200/70">Live forecast for your location</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <RecentActivityCard farmId={farmSlug} limit={3} />
      </div>
      
      {/* Call to Action Section */}
      <div className="bg-primary-600 text-white rounded-lg max-md:rounded-2xl shadow-lg max-md:shadow-primary-900/25 p-6 max-md:p-5">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="md:mb-0">
            <h3 className="text-xl max-md:text-lg font-bold leading-snug">Ready to optimize your farm operations?</h3>
            <p className="mt-1.5 text-sm max-md:text-[15px] text-white/90 leading-relaxed">
              Complete your farm profile to get personalized recommendations.
            </p>
          </div>
          <Link
            href={farmPath('/dashboard/settings?tab=profile')}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-primary-700 font-semibold hover:bg-gray-100 active:scale-[0.98] transition-transform text-center"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ params }: { params: { farmId: string } }) {
  return (
    <DashboardGuard>
      <DashboardContent params={params} />
    </DashboardGuard>
  );
}