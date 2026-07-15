'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiClient } from '@/lib/api';

const CHART_HEIGHT_MOBILE = 220;
const CHART_HEIGHT_DESKTOP = 280;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    return isMobile;
}

interface AnalyticsData {
  incomeExpenses: {
    month: string;
    monthNumber: number;
    income: number;
    expenses: number;
    netProfit: number;
    incomeCount: number;
    expenseCount: number;
  }[];
  eggTrends: {
    period: string;
    totalEggs: number;
    collections: number;
    averagePerCollection: number;
  }[];
  topFlocks: {
    flockName: string;
    performance: number;
    health: number;
    productivity: number;
    feedEfficiency: number;
    totalScore: number;
  }[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalEggs: number;
    averageEggsPerDay: number;
    topFlockCount: number;
  };
}

const formatCurrencyCompact = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'UGX 0';
    if (amount === 0) return 'UGX 0';
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '−' : '';
    if (abs >= 1_000_000) return `${sign}UGX ${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}UGX ${(abs / 1_000).toFixed(1)}K`;
    return `${sign}UGX ${abs.toLocaleString()}`;
};

const formatMargin = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return '0%';
    if (Math.abs(value) > 999) return value < 0 ? '<−999%' : '>999%';
    return `${value.toFixed(1)}%`;
};

const KpiCard = ({ title, value, change, positive }: { title: string; value: string; change: string; positive: boolean }) => (
  <div className="relative flex min-h-0 flex-col rounded-lg border border-gray-200/90 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
    <p className="mt-1 text-3xl font-bold tabular-nums text-gray-900 dark:text-white">{value}</p>
    <p className={`mt-2 text-xs ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {change}
    </p>
  </div>
);

const MobileStatTile = ({
    label,
    value,
    sub,
    positive,
    accent = 'gray',
}: {
    label: string;
    value: string;
    sub: string;
    positive: boolean;
    accent?: 'emerald' | 'rose' | 'violet' | 'amber' | 'gray';
}) => {
    const accents = {
        emerald: 'border-emerald-500/30 from-emerald-500/12 text-emerald-950 dark:text-emerald-100',
        rose: 'border-rose-500/30 from-rose-500/10 text-rose-950 dark:text-rose-100',
        violet: 'border-violet-500/30 from-violet-500/10 text-violet-950 dark:text-violet-100',
        amber: 'border-amber-400/35 from-amber-400/12 text-amber-950 dark:text-amber-100',
        gray: 'border-gray-200/80 from-gray-50/80 text-gray-900 dark:text-white',
    };
    return (
        <div
            className={`relative flex min-h-[6.5rem] min-w-0 flex-col overflow-hidden rounded-xl border bg-gradient-to-br via-white to-white p-3 shadow-md dark:via-gray-900 dark:to-gray-900/95 ${accents[accent]}`}
        >
            <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {label}
            </p>
            <p className="mt-1.5 truncate text-[1.05rem] font-extrabold tabular-nums leading-none">{value}</p>
            <p
                className={`mt-auto truncate pt-2 text-[10px] font-medium leading-snug ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
            >
                {sub}
            </p>
        </div>
    );
};

export default function AnalyticsPage() {
    const params = useParams();
    const farmId = params.farmId as string;
    const isMobile = useIsMobile();
    const [dateRange, setDateRange] = useState('30d');
    const [period, setPeriod] = useState('monthly');
    const [sortBy, setSortBy] = useState('performance');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const currentYear = new Date().getFullYear();
            const response = await apiClient.getAnalytics(farmId, currentYear, period, sortBy);
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch analytics data');
            }
            
            setAnalyticsData(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (farmId) {
            fetchAnalyticsData();
        }
    }, [farmId, period, sortBy]);

    const formatCurrency = (amount: number | undefined | null) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return 'UGX 0';
        }
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatPercentage = (value: number | undefined | null) => {
        if (value === undefined || value === null || isNaN(value)) {
            return '0.0%';
        }
        return `${value.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <div className="max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
                <div className="space-y-4 max-md:space-y-3 md:space-y-8">
                    <div className=" h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800 md:hidden" />

                    {/* KPI Cards Skeleton */}
                    <div className=" md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4">
                        <div className="mb-2 h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800 md:hidden" />
                        <div className="grid grid-cols-2 gap-2 md:contents">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800 ${i < 4 ? 'h-[6.5rem] md:h-auto md:rounded-lg md:bg-white md:p-6 md:shadow dark:md:bg-gray-800' : ''}`}>
                                    <div className="hidden md:block">
                                        <div className="mb-2 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="mb-2 h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Charts Grid Skeleton */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                        {/* Income vs Expenses Chart Skeleton */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>

                        {/* Egg Trends Chart Skeleton */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4 animate-pulse"></div>
                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* Top Flocks Table Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        {[...Array(6)].map((_, i) => (
                                            <th key={i} className="px-6 py-3">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {[...Array(3)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Performance Insights Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-4 animate-pulse"></div>
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-md:pb-[calc(6rem+env(safe-area-inset-bottom))]">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40 md:rounded-md">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading analytics</h3>
                            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
                            <button
                                onClick={fetchAnalyticsData}
                                className="mt-3 bg-red-100 dark:bg-red-800 px-3 py-1 rounded text-sm text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="max-md:pb-[calc(6rem+env(safe-area-inset-bottom))]">
                <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-gray-600">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No analytics data available</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Start adding financial records and egg collections to see analytics.</p>
                </div>
            </div>
        );
    }

    const netProfit = analyticsData.summary.netProfit || 0;
    const totalIncome = analyticsData.summary.totalIncome || 0;
    const totalExpenses = analyticsData.summary.totalExpenses || 0;
    const profitMargin = analyticsData.summary.profitMargin || 0;
    const totalEggs = analyticsData.summary.totalEggs || 0;
    const avgEggsPerDay = analyticsData.summary.averageEggsPerDay || 0;
    const topFlockCount = analyticsData.summary.topFlockCount || 0;
    const profitPositive = netProfit >= 0;

    const kpiData = [
        {
            title: 'Net Profit',
            value: formatCurrency(netProfit),
            change: `${formatPercentage(profitMargin)} profit margin`,
            positive: profitPositive,
        },
        {
            title: 'Total Income',
            value: formatCurrency(totalIncome),
            change: `vs ${formatCurrency(totalExpenses)} expenses`,
            positive: totalIncome > totalExpenses,
        },
        {
            title: 'Total Eggs Collected',
            value: totalEggs.toLocaleString(),
            change: `${avgEggsPerDay.toFixed(0)} avg per day`,
            positive: true,
        },
        {
            title: 'Top Performing Flocks',
            value: topFlockCount.toString(),
            change: 'flocks analyzed',
            positive: true,
        },
    ];
    
    const chartHeight = isMobile ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP;

    return (
        <div className="max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:space-y-0">
            <div className="mb-3 overflow-hidden bg-white shadow-md dark:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80 md:mb-6 md:rounded-xl md:shadow-lg">
                <div className="max-md:bg-gradient-to-br max-md:from-violet-500/12 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-violet-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 md:hidden">
                                <BarChart3 className="h-6 w-6" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">Farm analytics</h1>
                                <p className="mt-0.5 text-[13px] leading-snug text-gray-600 dark:text-gray-300 md:mt-1 md:text-lg md:text-gray-500">
                                    Insights into your farm&apos;s performance
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:mt-0 md:w-auto">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="input block w-full max-md:min-h-12 max-md:rounded-xl pl-3 pr-10 py-2 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm md:w-auto md:rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 md:mb-6 md:flex-row md:gap-4 md:rounded-xl md:p-6">
                <div className="min-w-0 flex-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold">Period</label>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="input block w-full max-md:min-h-12 max-md:rounded-xl pl-3 pr-10 py-2 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div className="min-w-0 flex-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold">Sort Flocks By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input block w-full max-md:min-h-12 max-md:rounded-xl pl-3 pr-10 py-2 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="performance">Performance</option>
                        <option value="health">Health</option>
                        <option value="productivity">Productivity</option>
                        <option value="feedEfficiency">Feed Efficiency</option>
                    </select>
                </div>
            </div>

            {/* Mobile: hero + compact 2×2 tiles */}
            <div className="mb-3 md:hidden">
                <div
                    className={`relative overflow-hidden rounded-2xl border p-4 shadow-md ${
                        profitPositive
                            ? 'border-violet-500/30 bg-gradient-to-br from-violet-500/14 via-white to-white dark:from-violet-500/18 dark:via-gray-800 dark:to-gray-800'
                            : 'border-orange-500/30 bg-gradient-to-br from-orange-500/12 via-white to-white dark:from-orange-500/15 dark:via-gray-800 dark:to-gray-800'
                    }`}
                >
                    <div
                        className={`pointer-events-none absolute left-0 top-0 h-1 w-full ${profitPositive ? 'bg-violet-500/55' : 'bg-orange-500/55'}`}
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Net {profitPositive ? 'profit' : 'loss'}
                    </p>
                    <p
                        className={`mt-1 text-[1.65rem] font-extrabold tabular-nums leading-tight tracking-tight ${
                            profitPositive ? 'text-violet-950 dark:text-violet-100' : 'text-orange-950 dark:text-orange-100'
                        }`}
                    >
                        {formatCurrencyCompact(netProfit)}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${profitPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatMargin(profitMargin)} margin
                    </p>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                    <MobileStatTile
                        label="Income"
                        value={formatCurrencyCompact(totalIncome)}
                        sub={`vs ${formatCurrencyCompact(totalExpenses)} exp.`}
                        positive={totalIncome > totalExpenses}
                        accent="emerald"
                    />
                    <MobileStatTile
                        label="Expenses"
                        value={formatCurrencyCompact(totalExpenses)}
                        sub={`${formatMargin(totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0)} of income`}
                        positive={totalExpenses <= totalIncome}
                        accent="rose"
                    />
                    <MobileStatTile
                        label="Eggs"
                        value={totalEggs.toLocaleString()}
                        sub={`${avgEggsPerDay.toFixed(0)} avg / day`}
                        positive
                        accent="amber"
                    />
                    <MobileStatTile
                        label="Flocks"
                        value={topFlockCount.toString()}
                        sub="analyzed"
                        positive
                        accent="violet"
                    />
                </div>
            </div>

            {/* Desktop: 4-column KPI row */}
            <div className="mb-3 hidden md:mb-6 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-6">
                {kpiData.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                ))}
            </div>

            <div className="mb-3 grid grid-cols-1 gap-3 md:mb-6 md:gap-4 lg:grid-cols-2 lg:gap-8">
                <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 md:rounded-lg md:p-6 md:shadow">
                    <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white md:mb-4 md:text-lg">Income vs. Expenses</h3>
                    {analyticsData.incomeExpenses.length > 0 ? (
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <BarChart data={analyticsData.incomeExpenses} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={48} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10 }} width={44} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="income" fill="#4ade80" name="Income" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" fill="#f87171" name="Expenses" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="netProfit" fill="#3b82f6" name="Net Profit" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <p>No financial data available for the selected period</p>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 md:rounded-lg md:p-6 md:shadow">
                    <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white md:mb-4 md:text-lg">Egg Collection Trends</h3>
                    {analyticsData.eggTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={chartHeight}>
                            <LineChart data={analyticsData.eggTrends} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="period" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={48} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10 }} width={36} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="totalEggs" stroke="#8884d8" name="Total Eggs" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="collections" stroke="#82ca9d" name="Collections" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="averagePerCollection" stroke="#ffc658" name="Avg / log" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <p>No egg collection data available for the selected period</p>
                        </div>
                    )}
                </div>
            </div>
            <div className=" overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 md:rounded-lg md:shadow">
                <div className="p-4 md:p-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white md:text-xl">Top performing flocks</h3>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 md:hidden">
                        {analyticsData.topFlocks.length} flock{analyticsData.topFlocks.length === 1 ? '' : 's'} ranked
                    </p>
                    <div className="mt-4">
                        {analyticsData.topFlocks.length > 0 ? (
                            <>
                            {/* Mobile: flock cards */}
                            <ul className="space-y-3 md:hidden">
                                {analyticsData.topFlocks.map((flock, index) => (
                                    <li
                                        key={index}
                                        className="rounded-xl border border-gray-200/90 bg-gray-50/50 p-3.5 dark:border-gray-700 dark:bg-gray-900/40"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                                                    {index + 1}
                                                </span>
                                                <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">
                                                    {flock.flockName}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Score</p>
                                                <p className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                                                    {(flock.totalScore || 0).toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <div className="rounded-lg bg-white px-2.5 py-2 dark:bg-gray-800">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Performance</p>
                                                <p className="text-sm font-semibold text-blue-600">{formatPercentage(flock.performance)}</p>
                                            </div>
                                            <div className="rounded-lg bg-white px-2.5 py-2 dark:bg-gray-800">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Health</p>
                                                <p className="text-sm font-semibold text-green-600">{formatPercentage(flock.health)}</p>
                                            </div>
                                            <div className="rounded-lg bg-white px-2.5 py-2 dark:bg-gray-800">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Productivity</p>
                                                <p className="text-sm font-semibold text-purple-600">{formatPercentage(flock.productivity)}</p>
                                            </div>
                                            <div className="rounded-lg bg-white px-2.5 py-2 dark:bg-gray-800">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Feed eff.</p>
                                                <p className="text-sm font-semibold text-orange-600">{formatPercentage(flock.feedEfficiency)}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* Desktop: table */}
                            <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Flock Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Performance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Health</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Productivity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feed Efficiency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Score</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {analyticsData.topFlocks.map((flock, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{flock.flockName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{formatPercentage(flock.performance)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatPercentage(flock.health)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">{formatPercentage(flock.productivity)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{formatPercentage(flock.feedEfficiency)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{(flock.totalScore || 0).toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                                <p>No flock data available for analysis</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
} 