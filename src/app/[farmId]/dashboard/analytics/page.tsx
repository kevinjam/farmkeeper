'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className={`mt-2 text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
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
            const response = await fetch(`/api/analytics/farms/${farmId}?year=${currentYear}&period=${period}&sortBy=${sortBy}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }
            
            const data = await response.json();
            setAnalyticsData(data);
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
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
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
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
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
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header and Date Filter */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Farm Analytics</h1>
                    <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">Insights into your farm's performance.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period</label>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort Flocks By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="performance">Performance</option>
                        <option value="health">Health</option>
                        <option value="productivity">Productivity</option>
                        <option value="feedEfficiency">Feed Efficiency</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpiData.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                ))}
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Income vs. Expenses */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs. Expenses</h3>
                    {analyticsData.incomeExpenses.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
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

                {/* Egg Collection Trends */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Egg Collection Trends</h3>
                    {analyticsData.eggTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
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
            
            {/* Data Tables */}
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Top Performing Flocks</h3>
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