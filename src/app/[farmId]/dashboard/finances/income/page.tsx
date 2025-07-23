'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecordSalePage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId } = params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, you would send this data to your API
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('New Income Data:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    // Redirect back to the finances dashboard
    router.push(`/${farmId}/dashboard/finances`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Record Farm Income / Sale</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Log any income generated from farm activities.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sale Date */}
              <div>
                <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Sale
                </label>
                <input
                  type="date"
                  name="saleDate"
                  id="saleDate"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Income Source */}
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Income Source / Product
                </label>
                <select
                  id="source"
                  name="source"
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Eggs</option>
                  <option>Live Birds (Broilers)</option>
                  <option>Live Birds (Spent Layers)</option>
                  <option>Dressed/Processed Birds</option>
                  <option>Manure</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description of Sale
              </label>
              <input
                type="text"
                name="description"
                id="description"
                required
                placeholder="e.g., 30 trays of Grade A eggs"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="0"
                    placeholder="e.g., 30"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Price per Unit */}
                <div>
                  <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price per Unit (UGX)
                  </label>
                  <input
                    type="number"
                    name="pricePerUnit"
                    id="pricePerUnit"
                    min="0"
                    placeholder="e.g., 10000"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Total Amount */}
                <div>
                  <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Amount (UGX)
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    id="totalAmount"
                    required
                    min="0"
                    placeholder="e.g., 300000"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer */}
                <div>
                  <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer / Buyer (Optional)
                  </label>
                  <input
                    type="text"
                    name="customer"
                    id="customer"
                    placeholder="e.g., Nakasero Market Vendor"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {/* Payment Method */}
                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Method
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Mobile Money</option>
                      <option>Credit</option>
                    </select>
                </div>
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
              {isSubmitting ? 'Saving...' : 'Record Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 