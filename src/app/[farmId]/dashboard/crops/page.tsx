'use client';

import Link from 'next/link';

const dummyCrops = [
  { name: 'Maize', area: '2 acres', status: 'Growing', nextAction: 'Fertilize', planted: '2024-05-10' },
  { name: 'Tomatoes', area: '0.5 acre', status: 'Harvesting', nextAction: 'Harvest', planted: '2024-04-01' },
  { name: 'Beans', area: '1 acre', status: 'Planted', nextAction: 'Weed', planted: '2024-06-15' },
];

export default function CropsDashboard({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crops Dashboard</h1>
        <Link
          href={`/${farmId}/dashboard/crops/add`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          + Add Crop
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Current Crops</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Crop</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Area</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Next Action</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Planted</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dummyCrops.map((crop, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">{crop.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{crop.area}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${crop.status === 'Growing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : crop.status === 'Harvesting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>{crop.status}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{crop.nextAction}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{crop.planted}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <Link href={`/${farmId}/dashboard/crops/${crop.name.toLowerCase()}`} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Placeholder for future analytics/graphs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Crop Analytics (Coming Soon)</h2>
        <div className="h-24 flex items-center justify-center text-gray-400 dark:text-gray-500">Charts and insights will appear here.</div>
      </div>
    </div>
  );
} 