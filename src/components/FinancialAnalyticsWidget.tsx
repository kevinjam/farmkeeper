'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface FinancialData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  growth: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
  };
  monthlyBreakdown: Array<{
    month: number;
    income: number;
    expenses: number;
    netProfit: number;
    incomeCount: number;
    expenseCount: number;
  }>;
  transactions: {
    totalTransactions: number;
    incomeTransactions: number;
    expenseTransactions: number;
  };
}

const FinancialAnalyticsWidget = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    if (amount === 0) return `${currency} 0`;
    
    if (Math.abs(amount) >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getMonthName = (monthNum: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNum - 1] || 'Unknown';
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getFinancialAnalytics();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.error || 'Failed to fetch financial analytics');
        }
      } catch (err) {
        console.error('Error fetching financial analytics:', err);
        setError('Error loading financial data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Financial Records Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Start by adding your first income or expense record.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Financial Analytics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your farm's financial performance</p>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Total Revenue</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(data.summary.totalRevenue)}
                </p>
                <p className={`text-xs ${data.growth.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.growth.revenueGrowth >= 0 ? '+' : ''}{data.growth.revenueGrowth.toFixed(1)}% from last period
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Total Expenses</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(data.summary.totalExpenses)}
                </p>
                <p className={`text-xs ${data.growth.expenseGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.growth.expenseGrowth >= 0 ? '+' : ''}{data.growth.expenseGrowth.toFixed(1)}% from last period
                </p>
              </div>
            </div>
          </div>

          <div className={`${data.summary.netProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} p-4 rounded-lg`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className={`h-8 w-8 ${data.summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${data.summary.netProfit >= 0 ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'}`}>
                  Net {data.summary.netProfit >= 0 ? 'Profit' : 'Loss'}
                </p>
                <p className={`text-lg font-bold ${data.summary.netProfit >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-orange-900 dark:text-orange-100'}`}>
                  {formatCurrency(data.summary.netProfit)}
                </p>
                <p className={`text-xs ${data.growth.profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.growth.profitGrowth >= 0 ? '+' : ''}{data.growth.profitGrowth.toFixed(1)}% from last period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        {data.monthlyBreakdown && data.monthlyBreakdown.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Monthly Breakdown</h4>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-2">
                {data.monthlyBreakdown.map((month) => (
                  <div key={month.month} className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg min-w-[120px]">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      {getMonthName(month.month)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      +{formatCurrency(month.income)}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      -{formatCurrency(month.expenses)}
                    </p>
                    <p className={`text-sm font-medium ${month.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {formatCurrency(month.netProfit)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.transactions.totalTransactions}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Transactions</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{data.transactions.incomeTransactions}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Income Records</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{data.transactions.expenseTransactions}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Expense Records</p>
          </div>
        </div>

        {/* Profit Margin */}
        {data.summary.totalRevenue > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Profit Margin</span>
              <span className={`text-sm font-bold ${data.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.summary.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${data.summary.profitMargin >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(Math.abs(data.summary.profitMargin), 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAnalyticsWidget;
