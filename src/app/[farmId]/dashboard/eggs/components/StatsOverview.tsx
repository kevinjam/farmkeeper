'use client';

interface StatsProps {
  stats: {
    totalEggsCollected: number;
    totalEggsSold: number;
    revenue: number;
    collectionRate: number;
  };
  isLoading: boolean;
}

export default function StatsOverview({ stats, isLoading }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
              Total Eggs Collected
            </p>
            {isLoading ? (
              <div className="h-6 w-16 bg-blue-200 dark:bg-blue-700 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.totalEggsCollected.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-green-600 dark:text-green-300">
              Total Eggs Sold
            </p>
            {isLoading ? (
              <div className="h-6 w-16 bg-green-200 dark:bg-green-700 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.totalEggsSold.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-300">
              Revenue
            </p>
            {isLoading ? (
              <div className="h-6 w-24 bg-purple-200 dark:bg-purple-700 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                ${stats.revenue.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4">
        <div className="flex items-center">
          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-300">
              Collection Rate
            </p>
            {isLoading ? (
              <div className="h-6 w-16 bg-amber-200 dark:bg-amber-700 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.collectionRate.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
