'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

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
      
      const response = await fetch(`/api/farms/${farmId}/eggs/collection`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch egg collections');
      }
      
      const data = await response.json();
      setCollections(data);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching egg collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
    
    // Refresh list when new record is added
    const handleRefresh = () => fetchCollections();
    window.addEventListener('refresh-egg-collections', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-egg-collections', handleRefresh);
    };
  }, [farmId]);

  const calculateEfficiency = (eggs: number, chickens: number) => {
    if (chickens === 0) return '0%';
    const efficiency = (eggs / chickens) * 100;
    return `${efficiency.toFixed(1)}%`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection record?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/farms/${farmId}/eggs/collection/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete record');
      }
      
      // Refresh the list
      fetchCollections();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white p-6 pb-3">
        Collection History
      </h2>
      
      {isLoading ? (
        <div className="p-6 text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading collections...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchCollections}
            className="mt-2 text-blue-500 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : collections.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No egg collection records found.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Use the form above to add your first record.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Eggs
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Chickens
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Efficiency
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {collections.map((collection) => (
                <tr key={collection._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {format(new Date(collection.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {collection.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {collection.chickens}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {calculateEfficiency(collection.quantity, collection.chickens)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {collection.notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(collection._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
