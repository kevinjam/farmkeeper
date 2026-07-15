'use client';

import { useState, useEffect } from 'react';
import { Egg, LayoutGrid, ShoppingCart } from 'lucide-react';
import { apiClient } from '@/lib/api';

import EggCollectionForm from './components/EggCollectionForm';
import EggCollectionList from './components/EggCollectionList';
import SalesTracker from './components/SalesTracker';
import StatsOverview from './components/StatsOverview';

export default function EggsAndSalesPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const [activeTab, setActiveTab] = useState('collection');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEggsCollected: 0,
    totalEggsSold: 0,
    revenue: 0,
    collectionRate: 0,
  });

  useEffect(() => {
    if (!farmId) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const collectionsResponse = await apiClient.getEggCollections(farmId);
        if (collectionsResponse.success) {
          const collections = collectionsResponse.data || [];
          const totalEggsCollected = collections.reduce((sum: number, c: { quantity: number }) => sum + c.quantity, 0);
          const totalEggsSold = 0;
          const revenue = 0;
          const collectionRate = collections.length > 0 ? totalEggsCollected / collections.length : 0;

          setStats({
            totalEggsCollected,
            totalEggsSold,
            revenue,
            collectionRate,
          });
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
    <div className="max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="max-md:bg-gradient-to-br max-md:from-amber-400/14 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-amber-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:items-start max-md:gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-800 dark:bg-amber-500/18 dark:text-amber-200 md:hidden">
              <Egg className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Eggs &amp; sales</h1>
              <p className="mt-0.5 text-[13px] leading-snug text-gray-600 dark:text-gray-300 md:mt-1 md:text-sm">
                Log collections and follow sales from one workspace
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-6">
            <StatsOverview stats={stats} isLoading={isLoading} />
          </div>
        </div>
      </div>

      <div className="mt-4 max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white max-md:shadow-md dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800 md:mt-6 md:rounded-xl md:border md:border-gray-200/80 md:bg-white md:shadow-lg dark:md:border-gray-700 dark:md:bg-gray-800">
        <div className="max-md:border-b max-md:border-gray-100 max-md:p-2 dark:max-md:border-gray-700 md:border-b md:border-gray-200 md:dark:border-gray-700">
          <nav className="flex max-md:gap-1 md:px-2" aria-label="Eggs sections">
            <button
              type="button"
              onClick={() => setActiveTab('collection')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-colors md:flex-none md:rounded-none md:border-b-2 md:px-6 md:py-3 ${
                activeTab === 'collection'
                  ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100 md:border-amber-500 md:bg-transparent md:text-blue-600 dark:md:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 md:border-transparent md:text-gray-500 md:hover:text-gray-700 dark:md:hover:text-gray-300'
              }`}
            >
              <LayoutGrid className="h-4 w-4 shrink-0 opacity-80" />
              <span className="max-md:truncate">Collection</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-colors md:flex-none md:rounded-none md:border-b-2 md:px-6 md:py-3 ${
                activeTab === 'sales'
                  ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100 md:border-amber-500 md:bg-transparent md:text-blue-600 dark:md:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 md:border-transparent md:text-gray-500 md:hover:text-gray-700 dark:md:hover:text-gray-300'
              }`}
            >
              <ShoppingCart className="h-4 w-4 shrink-0 opacity-80" />
              <span className="max-md:truncate">Sales</span>
            </button>
          </nav>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'collection' ? (
            <div className="space-y-0 md:space-y-6">
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
