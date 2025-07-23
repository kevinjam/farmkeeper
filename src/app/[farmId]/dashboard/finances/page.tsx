'use client';

import Link from 'next/link';

const dummySummary = [
  { label: 'Total Income', value: 'UGX 12,500,000', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { label: 'Total Expenses', value: 'UGX 7,800,000', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { label: 'Balance', value: 'UGX 4,700,000', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
];

const dummyTransactions = [
  { date: '2024-07-01', type: 'Sale', description: 'Eggs - 30 trays', amount: '+UGX 300,000', category: 'Income' },
  { date: '2024-06-29', type: 'Expense', description: 'Feed - 10 bags', amount: '-UGX 150,000', category: 'Feed' },
  { date: '2024-06-28', type: 'Expense', description: 'Veterinary visit', amount: '-UGX 80,000', category: 'Medication' },
  { date: '2024-06-27', type: 'Sale', description: 'Live birds', amount: '+UGX 500,000', category: 'Income' },
];

export default function FinancesDashboard({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {dummySummary.map((item, idx) => (
          <div key={idx} className={`rounded-lg shadow p-6 ${item.color}`}>
            <div className="text-xs font-medium uppercase mb-1">{item.label}</div>
            <div className="text-2xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dummyTransactions.map((tx, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{tx.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.type === 'Sale' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{tx.type}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{tx.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap font-bold {tx.type === 'Sale' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}">{tx.amount}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{tx.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Placeholder for future analytics/graphs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Financial Analytics (Coming Soon)</h2>
        <div className="h-24 flex items-center justify-center text-gray-400 dark:text-gray-500">Charts and insights will appear here.</div>
      </div>
    </div>
  );
} 