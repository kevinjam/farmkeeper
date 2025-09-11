'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddCropModal from '../../../../components/AddCropModal';

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
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CropsDashboard({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Fetch crops from API
  const fetchCrops = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/farms/${farmId}/crops`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        setCrops(result.data || []);
        setError(null);
      } else {
        setError('Failed to fetch crops');
      }
    } catch (err) {
      console.error('Error fetching crops:', err);
      setError('Failed to fetch crops');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete crop
  const handleDelete = async (cropId: string) => {
    try {
      const response = await fetch(`/api/farms/${farmId}/crops/${cropId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setCrops(crops.filter(crop => crop._id !== cropId));
        setDeleteConfirm(null);
      } else {
        setError('Failed to delete crop');
      }
    } catch (err) {
      console.error('Error deleting crop:', err);
      setError('Failed to delete crop');
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
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
    fetchCrops();
  }, [farmId]);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchCrops}
            className="ml-4 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crops Dashboard</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          + Add Crop
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Current Crops</h2>
        
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : crops.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No crops found. Start by adding your first crop!</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              + Add Your First Crop
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Crop</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Area</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Planted</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {crops.map((crop) => (
                  <tr key={crop._id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{crop.name}</div>
                        {crop.variety && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{crop.variety}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 capitalize">
                      {crop.cropType.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {crop.area} {crop.areaUnit}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(crop.status)}`}>
                        {crop.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {formatDate(crop.plantedDate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right space-x-2">
                      <Link 
                        href={`/${farmId}/dashboard/crops/${crop._id}`} 
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/${farmId}/dashboard/crops/${crop._id}/edit`} 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => setDeleteConfirm({ id: crop._id, name: crop.name })}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
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
      {/* Crop Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Crop Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Crops</h3>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{crops.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Active Crops</h3>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {crops.filter(c => ['planted', 'growing'].includes(c.status)).length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Total Area</h3>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {crops.reduce((sum, crop) => sum + crop.area, 0).toFixed(1)} acres
            </p>
          </div>
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
                  Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      <AddCropModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        farmId={farmId}
        onSuccess={() => {
          fetchCrops(); // Refresh crops list after successful creation
        }}
      />
    </div>
  );
} 