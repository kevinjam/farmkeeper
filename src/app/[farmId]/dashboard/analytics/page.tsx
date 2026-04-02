'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiClient } from '@/lib/api';

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

const KpiCard = ({ title, value, change, positive }: { title: string; value: string; change: string; positive: boolean }) => (
  <div className="relative flex min-h-[6.75rem] flex-col rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 md:min-h-0 md:rounded-lg md:p-6 md:shadow">
    <h3 className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 dark:text-gray-400 md:text-sm md:font-medium md:normal-case md:tracking-normal">
      {title}
    </h3>
    <p className="mt-1.5 text-[1.2rem] font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:mt-1 md:text-3xl md:font-bold md:tracking-normal">
      {value}
    </p>
    <p
      className={`mt-auto pt-2 text-[10px] font-medium leading-snug md:mt-2 md:text-xs ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
    >
      {change}
    </p>
  </div>
);

export default function AnalyticsPage() {
    const params = useParams();
    const farmId = params.farmId as string;
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
            <div className="max-w-7xl mx-auto max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] py-8 px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    {/* Header Skeleton */}
                    <div className="text-center">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
                    </div>

                    {/* KPI Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <div className="max-w-7xl mx-auto max-md:mx-3 max-md:pb-[calc(6rem+env(safe-area-inset-bottom))] py-8 px-4 sm:px-6 lg:px-8">
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
            <div className="max-w-7xl mx-auto max-md:mx-3 max-md:pb-[calc(6rem+env(safe-area-inset-bottom))] py-8 px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-gray-600">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No analytics data available</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Start adding financial records and egg collections to see analytics.</p>
                </div>
            </div>
        );
    }

    const kpiData = [
        {
            title: 'Net Profit',
            value: formatCurrency(analyticsData.summary.netProfit || 0),
            change: `${formatPercentage(analyticsData.summary.profitMargin || 0)} profit margin`,
            positive: (analyticsData.summary.netProfit || 0) > 0
        },
        {
            title: 'Total Income',
            value: formatCurrency(analyticsData.summary.totalIncome || 0),
            change: `vs ${formatCurrency(analyticsData.summary.totalExpenses || 0)} expenses`,
            positive: (analyticsData.summary.totalIncome || 0) > (analyticsData.summary.totalExpenses || 0)
        },
        {
            title: 'Total Eggs Collected',
            value: (analyticsData.summary.totalEggs || 0).toLocaleString(),
            change: `${(analyticsData.summary.averageEggsPerDay || 0).toFixed(0)} avg per day`,
            positive: true
        },
        {
            title: 'Top Performing Flocks',
            value: (analyticsData.summary.topFlockCount || 0).toString(),
            change: 'flocks analyzed',
            positive: true
        }
    ];
    
    return (
        <div className="max-w-7xl mx-auto max-md:px-0 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 overflow-hidden bg-white shadow-md dark:bg-gray-800 max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80 md:rounded-xl md:shadow-lg">
                <div className="max-md:bg-gradient-to-br max-md:from-violet-500/12 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-violet-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">Farm analytics</h1>
                            <p className="mt-1 text-[13px] text-gray-600 dark:text-gray-300 md:text-lg md:text-gray-500">
                                Insights into your farm&apos;s performance.
                            </p>
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

            <div className="mb-6 max-md:mx-3 flex flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 md:flex-row md:rounded-xl md:p-6">
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

            <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-6 max-md:px-3">
                {kpiData.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                ))}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 max-md:mx-3 lg:grid-cols-2 lg:gap-8">
                <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 md:rounded-lg md:p-6 md:shadow">
                    <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white md:text-lg">Income vs. Expenses</h3>
                    {analyticsData.incomeExpenses.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={analyticsData.incomeExpenses}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="income" fill="#4ade80" name="Income" />
                                <Bar dataKey="expenses" fill="#f87171" name="Expenses" />
                                <Bar dataKey="netProfit" fill="#3b82f6" name="Net Profit" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <p>No financial data available for the selected period</p>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 md:rounded-lg md:p-6 md:shadow">
                    <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white md:text-lg">Egg Collection Trends</h3>
                    {analyticsData.eggTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={analyticsData.eggTrends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="totalEggs" stroke="#8884d8" name="Total Eggs" />
                                <Line type="monotone" dataKey="collections" stroke="#82ca9d" name="Collections" />
                                <Line type="monotone" dataKey="averagePerCollection" stroke="#ffc658" name="Avg per Collection" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <p>No egg collection data available for the selected period</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="max-md:mx-3 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 md:rounded-lg md:shadow">
                <div className="p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white md:text-xl">Top Performing Flocks</h3>
                    <div className="mt-4 overflow-x-auto">
                        {analyticsData.topFlocks.length > 0 ? (
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