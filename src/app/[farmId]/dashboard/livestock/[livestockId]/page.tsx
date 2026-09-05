'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';

// Define type for livestock data
type Livestock = {
  _id: string;
  name: string;
  type: string;
  breed?: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  acquisitionDate: string;
  healthStatus: 'healthy' | 'sick' | 'recovering' | 'quarantine';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function LivestockViewPage({ 
  params 
}: { 
  params: { farmId: string; livestockId: string } 
}) {
  const router = useRouter();
  const { farmId, livestockId } = params;
  const { farmPath } = useFarmPaths(farmId);
  const [livestock, setLivestock] = useState<Livestock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch livestock data
  useEffect(() => {
    const fetchLivestock = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await apiClient.getLivestock(farmId);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch livestock data');
        }
        
        // Find the specific livestock item from the list
        const livestockItem = response.data?.find((item: any) => item._id === livestockId);
        if (!livestockItem) {
          throw new Error('Livestock not found');
        }
        
        setLivestock(livestockItem);
      } catch (err) {
        console.error('Error fetching livestock:', err);
        setError('Failed to load livestock data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLivestock();
  }, [farmId, livestockId]);

  // Delete livestock function
  const handleDeleteLivestock = async () => {
    try {
      setIsDeleting(true);
      const response = await apiClient.deleteLivestock(farmId, livestockId);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete livestock');
      }

      router.push(farmPath('/dashboard/livestock'));
    } catch (err) {
      console.error('Error deleting livestock:', err);
      setError('Failed to delete livestock. Please try again.');
      setIsDeleting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get health status color
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sick':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'recovering':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'quarantine':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Link 
          href={farmPath('/dashboard/livestock')}
          className="text-primary-600 hover:text-primary-800 underline"
        >
          Back to Livestock List
        </Link>
      </div>
    );
  }

  if (!livestock) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">Livestock not found</div>
        <Link 
          href={farmPath('/dashboard/livestock')}
          className="text-primary-600 hover:text-primary-800 underline"
        >
          Back to Livestock List
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-2">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link 
              href={farmPath('/dashboard/livestock')}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium mb-2 inline-flex items-center"
            >
              ← Back to Livestock
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{livestock.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {livestock.type.charAt(0).toUpperCase() + livestock.type.slice(1)}
              {livestock.breed && ` • ${livestock.breed}`}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={farmPath(`/dashboard/livestock/${livestockId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Edit
            </Link>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-800 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{livestock.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white capitalize">{livestock.type}</p>
              </div>
              
              {livestock.breed && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Breed</label>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">{livestock.breed}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Gender</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white capitalize">{livestock.gender}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Age</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{livestock.age} months</p>
              </div>
              
              {livestock.weight && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Weight</label>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">{livestock.weight} kg</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Acquisition Date</label>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{formatDate(livestock.acquisitionDate)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Health Status</label>
                <span className={`mt-1 inline-flex px-2 py-1 text-sm font-medium rounded-full ${getHealthStatusColor(livestock.healthStatus)}`}>
                  {livestock.healthStatus.charAt(0).toUpperCase() + livestock.healthStatus.slice(1)}
                </span>
              </div>
            </div>
            
            {livestock.notes && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{livestock.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Record Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Record Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(livestock.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(livestock.updatedAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">ID</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{livestock._id}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                href={farmPath(`/dashboard/livestock/${livestockId}/edit`)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit Details
              </Link>
              
              <button
                onClick={() => setDeleteConfirm(true)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      </div>

      {deleteConfirm ? (
        <ConfirmDeleteDialog
          title={`Delete ${livestock.name}?`}
          body="This cannot be undone. The animal record will be removed from your farm."
          isWorking={isDeleting}
          onClose={() => setDeleteConfirm(false)}
          onDelete={() => void handleDeleteLivestock()}
        />
      ) : null}
    </div>
  );
}
