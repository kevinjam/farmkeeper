'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecordEggsPage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId } = params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, you would send this data to your API
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('New Egg Collection Data:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    // Redirect back to the eggs dashboard
    router.push(`/${farmId}/dashboard/eggs`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Record Egg Collection</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Log the number of eggs collected for a specific day.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Collection Date */}
            <div>
              <label htmlFor="collectionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Collection
              </label>
              <input
                type="date"
                name="collectionDate"
                id="collectionDate"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Flock Details Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Flock Details for Today</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* House/Batch */}
                <div>
                  <label htmlFor="house" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    House / Batch
                  </label>
                  <select
                    id="house"
                    name="house"
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option>House A</option>
                    <option>House B</option>
                    <option>House C</option>
                    <option>Free Range Batch 1</option>
                  </select>
                </div>
                {/* Number of Chickens */}
                <div>
                  <label htmlFor="chickenCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Birds
                  </label>
                  <input type="number" name="chickenCount" id="chickenCount" min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                {/* Mortality Count */}
                <div>
                  <label htmlFor="mortality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mortality Count
                  </label>
                  <input type="number" name="mortality" id="mortality" defaultValue="0" min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                {/* Food Consumed */}
                <div>
                  <label htmlFor="foodConsumed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Food Consumed (kg)
                  </label>
                  <input type="number" step="0.1" name="foodConsumed" id="foodConsumed" min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantity Collected */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Eggs Collected
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    required
                    min="0"
                    placeholder="e.g., 450"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Damaged Eggs */}
                <div>
                  <label htmlFor="damaged" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Broken or Damaged Eggs
                  </label>
                  <input
                    type="number"
                    name="damaged"
                    id="damaged"
                    min="0"
                    defaultValue="0"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
            </div>

            {/* Egg Size Distribution */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Size Distribution (Optional)</h3>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="size_xl" className="block text-xs font-medium text-gray-500 dark:text-gray-400">Extra Large</label>
                    <input type="number" name="size_xl" id="size_xl" min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="size_l" className="block text-xs font-medium text-gray-500 dark:text-gray-400">Large</label>
                    <input type="number" name="size_l" id="size_l" min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="size_m" className="block text-xs font-medium text-gray-500 dark:text-gray-400">Medium</label>
                    <input type="number" name="size_m" id="size_m" min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="size_s" className="block text-xs font-medium text-gray-500 dark:text-gray-400">Small</label>
                    <input type="number" name="size_s" id="size_s" min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
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
                rows={3}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., First collection from Batch B, unusually pale shells today..."
              ></textarea>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 text-right">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Record Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 