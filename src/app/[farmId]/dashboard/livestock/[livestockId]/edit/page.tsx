'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

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

export default function LivestockEditPage({ 
  params 
}: { 
  params: { farmId: string; livestockId: string } 
}) {
  const router = useRouter();
  const { farmId, livestockId } = params;
  const [livestock, setLivestock] = useState<Livestock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        breed: formData.get('breed') as string || undefined,
        age: parseInt(formData.get('age') as string),
        gender: formData.get('gender') as string,
        weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
        acquisitionDate: formData.get('acquisitionDate') as string,
        healthStatus: formData.get('healthStatus') as string,
        notes: formData.get('notes') as string || undefined,
      };

      const response = await apiClient.updateLivestock(farmId, livestockId, data);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update livestock');
      }

      router.push(`/${farmId}/dashboard/livestock/${livestockId}`);
    } catch (error) {
      console.error('Error updating livestock:', error);
      setError('Failed to update livestock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !livestock) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Link 
          href={`/${farmId}/dashboard/livestock`}
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
          href={`/${farmId}/dashboard/livestock`}
          className="text-primary-600 hover:text-primary-800 underline"
        >
          Back to Livestock List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href={`/${farmId}/dashboard/livestock/${livestockId}`}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium mb-2 inline-flex items-center"
              >
                ← Back to {livestock.name}
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit {livestock.name}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update the information for this animal.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400">
            <div className="text-red-700 dark:text-red-400">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Animal Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  defaultValue={livestock.name}
                  placeholder="e.g., Bessie, Chicken #1"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Livestock Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Animal Type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue={livestock.type}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="chicken">Chicken</option>
                  <option value="cow">Cow</option>
                  <option value="goat">Goat</option>
                  <option value="sheep">Sheep</option>
                  <option value="pig">Pig</option>
                  <option value="duck">Duck</option>
                  <option value="turkey">Turkey</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Breed */}
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Breed (Optional)
                </label>
                <input
                  type="text"
                  name="breed"
                  id="breed"
                  defaultValue={livestock.breed || ''}
                  placeholder="e.g., Holstein, Rhode Island Red"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  defaultValue={livestock.gender}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Age (months)
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  required
                  min="0"
                  defaultValue={livestock.age}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Weight */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weight (kg) - Optional
                </label>
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  min="0"
                  step="0.1"
                  defaultValue={livestock.weight || ''}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Acquisition Date */}
              <div>
                <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Acquisition
                </label>
                <input
                  type="date"
                  name="acquisitionDate"
                  id="acquisitionDate"
                  required
                  defaultValue={livestock.acquisitionDate.split('T')[0]}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Health Status */}
              <div>
                <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Health Status
                </label>
                <select
                  id="healthStatus"
                  name="healthStatus"
                  required
                  defaultValue={livestock.healthStatus}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="healthy">Healthy</option>
                  <option value="sick">Sick</option>
                  <option value="recovering">Recovering</option>
                  <option value="quarantine">Quarantine</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                defaultValue={livestock.notes || ''}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Any additional details about this animal..."
              ></textarea>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 text-right border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/${farmId}/dashboard/livestock/${livestockId}`}
              className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
