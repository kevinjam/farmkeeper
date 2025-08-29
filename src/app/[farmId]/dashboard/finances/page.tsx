'use client';

import Link from 'next/link';
import FinancialAnalyticsWidget from '@/components/FinancialAnalyticsWidget';
import FinancialRecordsManager from '@/components/FinancialRecordsManager';

export default function FinancesDashboard({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finances Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href={`/${farmId}/dashboard/finances/expense`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            + Add Expense
          </Link>
          <Link
            href={`/${farmId}/dashboard/finances/income`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            + Record Sale
          </Link>
        </div>
      </div>

      {/* Financial Analytics Widget */}
      <div className="mb-8">
        <FinancialAnalyticsWidget />
      </div>

      {/* Financial Records Manager - CRUD Interface */}
      <div className="mb-8">
        <FinancialRecordsManager />
      </div>
    </div>
  );
} 