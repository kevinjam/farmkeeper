'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Dummy Data - Replace with API calls
const kpiData = [
  { title: 'Overall Profitability', value: '+15.2%', change: '+2.5% vs last month', positive: true },
  { title: 'Egg Production Rate', value: '85%', change: '-1.2% vs last month', positive: false },
  { title: 'Feed Conversion Ratio', value: '2.1', change: '+0.1 vs last month', positive: false },
  { title: 'Average Cost per Bird', value: 'UGX 8,500', change: '+UGX 250 vs last month', positive: false },
];

const incomeVsExpenseData = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
];

const eggCollectionData = [
    { date: '01/07', eggs: 450 },
    { date: '02/07', eggs: 465 },
    { date: '03/07', eggs: 472 },
    { date: '04/07', eggs: 460 },
    { date: '05/07', eggs: 480 },
    { date: '06/07', eggs: 495 },
    { date: '07/07', eggs: 485 },
];

const topFlocksData = [
    { name: 'House A', productionRate: '92%', feedRatio: 1.9 },
    { name: 'House C', productionRate: '88%', feedRatio: 2.0 },
    { name: 'Free Range 1', productionRate: '85%', feedRatio: 2.2 },
];

const KpiCard = ({ title, value, change, positive }: { title: string; value: string; change: string; positive: boolean }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className={`mt-2 text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
    </div>
);

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState('30d');
    
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
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={incomeVsExpenseData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="income" fill="#4ade80" name="Income" />
                            <Bar dataKey="expenses" fill="#f87171" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Egg Collection Trends */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Egg Collection Trends</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={eggCollectionData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="eggs" stroke="#8884d8" name="Eggs Collected" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Data Tables */}
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Top Performing Flocks</h3>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Flock / House</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Production Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feed Conversion Ratio</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {topFlocksData.map((flock) => (
                                    <tr key={flock.name}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{flock.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{flock.productionRate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{flock.feedRatio}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
} 