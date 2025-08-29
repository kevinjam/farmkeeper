'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Crop {
  _id: string;
  name: string;
  cropType: string;
  variety?: string;
  area: number;
  areaUnit: string;
  status: string;
  plantedDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  yield?: number;
  yieldUnit?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  daysSincePlanted?: number;
  daysUntilHarvest?: number;
}

export default function CropView({ params }: { params: { farmId: string; cropId: string } }) {
  const { farmId, cropId } = params;
  const router = useRouter();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchCrop = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/farms/${farmId}/crops/${cropId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        setCrop(result.data);
        setError(null);
      } else if (response.status === 404) {
        setError('Crop not found');
      } else {
        setError('Failed to fetch crop details');
      }
    } catch (err) {
      console.error('Error fetching crop:', err);
      setError('Failed to fetch crop details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/farms/${farmId}/crops/${cropId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        router.push(`/${farmId}/dashboard/crops`);
      } else {
        setError('Failed to delete crop');
      }
    } catch (err) {
      console.error('Error deleting crop:', err);
      setError('Failed to delete crop');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'harvested':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'planted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'planned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  useEffect(() => {
    fetchCrop();
  }, [farmId, cropId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error || 'Crop not found'}</span>
          <div className="mt-4">
            <Link 
              href={`/${farmId}/dashboard/crops`}
              className="underline hover:no-underline mr-4"
            >
              Back to Crops
            </Link>
            <button 
              onClick={fetchCrop}
              className="underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link 
            href={`/${farmId}/dashboard/crops`}
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Crops
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{crop.name}</h1>
          {crop.variety && (
            <p className="text-gray-600 dark:text-gray-400">{crop.variety}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/${farmId}/dashboard/crops/${cropId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Edit Crop
          </Link>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-800 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Crop Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Crop Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Crop Type</span>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {crop.cropType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(crop.status)}`}>
                      {crop.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Area</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {crop.area} {crop.areaUnit}
                  </p>
                </div>
                {crop.location && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                    <p className="font-medium text-gray-900 dark:text-white">{crop.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Important Dates</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Planted Date</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(crop.plantedDate)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Expected Harvest</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(crop.expectedHarvestDate)}
                  </p>
                </div>
                {crop.actualHarvestDate && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Actual Harvest</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(crop.actualHarvestDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Yield & Performance */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Performance</h3>
              <div className="space-y-3">
                {crop.yield && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Yield</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {crop.yield} {crop.yieldUnit || 'units'}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(crop.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(crop.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {crop.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{crop.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">Delete Crop</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete "{crop.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
