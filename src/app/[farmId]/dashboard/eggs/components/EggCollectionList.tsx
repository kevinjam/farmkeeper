'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Egg, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface EggCollection {
  _id: string;
  date: string;
  quantity: number;
  chickens: number;
  notes?: string;
  createdAt: string;
}

interface EggCollectionListProps {
  farmId: string;
}

export default function EggCollectionList({ farmId }: EggCollectionListProps) {
  const [collections, setCollections] = useState<EggCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await apiClient.getEggCollections(farmId);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch egg collections');
      }

      setCollections(response.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      console.error('Error fetching egg collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();

    const handleRefresh = () => fetchCollections();
    window.addEventListener('refresh-egg-collections', handleRefresh);

    return () => {
      window.removeEventListener('refresh-egg-collections', handleRefresh);
    };
  }, [farmId]);

  const calculateEfficiency = (eggs: number, chickens: number) => {
    if (chickens === 0) return '0%';
    return `${((eggs / chickens) * 100).toFixed(1)}%`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection record?')) {
      return;
    }

    try {
      const response = await apiClient.deleteEggCollection(farmId, id);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete record');
      }

      fetchCollections();
    } catch (err: unknown) {
      alert(`Error: ${err instanceof Error ? err.message : 'Delete failed'}`);
    }
  };

  return (
    <div className="max-md:-mx-0 max-md:mt-6 max-md:border-t max-md:border-gray-100 max-md:pt-5 max-md:dark:border-gray-700 md:mt-0 md:rounded-lg md:border md:border-gray-200/80 md:bg-white md:shadow dark:md:border-gray-700 dark:md:bg-gray-800">
      <div className="flex items-center justify-between md:p-6 md:pb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white md:text-xl md:font-semibold">
            Collection history
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 md:hidden">
            {isLoading ? 'Loading…' : `${collections.length} record${collections.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-2 md:p-6 md:pt-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[4.5rem] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800/80 md:hidden" />
          ))}
          <div className="hidden md:block md:text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading collections…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950/40 md:m-6 md:mt-0">
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <button type="button" onClick={fetchCollections} className="mt-2 text-sm font-semibold text-amber-600">
            Retry
          </button>
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center dark:border-gray-600 dark:bg-gray-900/40 md:m-6 md:mt-0">
          <Egg className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">No collections yet</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Log your first collection above.</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800 md:hidden">
            {collections.map((collection) => (
              <li key={collection._id} className="py-3.5 first:pt-0">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                    <Egg className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-gray-900 dark:text-white">
                          {collection.quantity} eggs
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(collection.date), 'MMM d, yyyy')} · {collection.chickens} hens ·{' '}
                          {calculateEfficiency(collection.quantity, collection.chickens)} eff.
                        </p>
                      </div>
                    </div>
                    {collection.notes && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{collection.notes}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(collection._id)}
                      className="mt-2.5 inline-flex items-center gap-1 rounded-lg border border-red-200/80 px-2.5 py-1 text-xs font-medium text-red-600 active:scale-[0.98] dark:border-red-900/40 dark:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Eggs
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Chickens
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Efficiency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Notes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {collections.map((collection) => (
                  <tr key={collection._id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {format(new Date(collection.date), 'MMM d, yyyy')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {collection.quantity}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {collection.chickens}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {calculateEfficiency(collection.quantity, collection.chickens)}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {collection.notes || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button type="button" onClick={() => handleDelete(collection._id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
