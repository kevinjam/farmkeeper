'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddLivestockPage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId } = params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, you would send this data to your API
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('New Livestock Data:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    // Redirect back to the livestock list or dashboard
    router.push(`/${farmId}/dashboard/livestock`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Livestock</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Register a new batch of birds for your farm.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Livestock Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type of Bird
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Chicken - Broiler</option>
                  <option>Chicken - Layer</option>
                  <option>Turkey</option>
                  <option>Duck</option>
                  <option>Quail</option>
                </select>
              </div>

              {/* Breed */}
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  id="breed"
                  placeholder="e.g., Ross 308, ISA Brown"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  required
                  min="1"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Acquisition Date */}
              <div>
                <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Acquisition / Hatch
                </label>
                <input
                  type="date"
                  name="acquisitionDate"
                  id="acquisitionDate"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Batch Name */}
            <div>
              <label htmlFor="batchName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Batch Name / ID (Optional)
              </label>
              <input
                type="text"
                name="batchName"
                id="batchName"
                placeholder="e.g., July Broiler Batch 2025"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost per Bird */}
                <div>
                  <label htmlFor="costPerBird" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cost per Bird (UGX)
                  </label>
                  <input
                    type="number"
                    name="costPerBird"
                    id="costPerBird"
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Source */}
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source / Supplier
                  </label>
                  <input
                    type="text"
                    name="source"
                    id="source"
                    placeholder="e.g., UGACHICK"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
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
                placeholder="Any additional details about this batch..."
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
              {isSubmitting ? 'Saving...' : 'Add Livestock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 