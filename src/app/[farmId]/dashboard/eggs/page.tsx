'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// Components
import EggCollectionForm from './components/EggCollectionForm';
import EggCollectionList from './components/EggCollectionList';
import SalesTracker from './components/SalesTracker';
import StatsOverview from './components/StatsOverview';

export default function EggsAndSalesPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('collection');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEggsCollected: 0,
    totalEggsSold: 0,
    revenue: 0,
    collectionRate: 0
  });

  // Fetch egg collection stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/farms/${farmId}/eggs/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch egg stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [farmId]);

  return (
    <div className="container mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Egg Collection & Sales
        </h1>
        
        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={isLoading} />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6">
        <nav className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'collection'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Collection Records
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'sales'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Sales Tracker
          </button>
        </nav>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'collection' ? (
            <div className="space-y-6">
              <EggCollectionForm farmId={farmId} />
              <EggCollectionList farmId={farmId} />
            </div>
          ) : (
            <SalesTracker farmId={farmId} />
          )}
        </div>
      </div>
    </div>
  );
}
