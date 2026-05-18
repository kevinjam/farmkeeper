'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Beef, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';

const inputClass =
  'mt-1.5 block w-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white max-md:min-h-12 max-md:rounded-xl max-md:px-3.5 max-md:text-base md:rounded-lg md:py-2 md:pl-3 md:pr-3 md:text-sm [font-size:16px]';
const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const sectionTitleClass =
  'text-lg font-semibold text-gray-900 dark:text-white max-md:text-base max-md:font-bold';

export default function AddLivestockPage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        breed: (formData.get('breed') as string) || undefined,
        age: parseInt(formData.get('age') as string),
        gender: formData.get('gender') as string,
        weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
        acquisitionDate: formData.get('acquisitionDate') as string,
        healthStatus: formData.get('healthStatus') as string,
        notes: (formData.get('notes') as string) || undefined,
      };

      const response = await apiClient.createLivestock(farmId, data);

      if (!response.success) {
        throw new Error(response.error || 'Failed to add livestock');
      }

      router.push(farmPath('/dashboard/livestock'));
    } catch (error) {
      console.error('Error adding livestock:', error);
      alert('Failed to add livestock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl max-md:max-w-full md:px-4 md:py-8 lg:px-8 max-md:px-0 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 dark:border-gray-700 max-md:border-gray-200/80 max-md:bg-gradient-to-br max-md:from-emerald-500/10 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-emerald-500/10 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:items-start max-md:gap-3 md:block">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 md:hidden">
              <Beef className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white max-md:text-lg max-md:leading-tight">
                Add new livestock
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-md:mt-0.5 max-md:text-[13px] max-md:leading-snug">
                Register an animal on your farm.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6 max-md:space-y-5 max-md:p-4">
            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:bg-gray-50/80 max-md:p-4 dark:max-md:border-gray-700/60 dark:max-md:bg-gray-900/40">
              <h3 className={sectionTitleClass}>Animal details</h3>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Animal name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="e.g. Bessie, Chicken #1"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="type" className={labelClass}>
                    Animal type
                  </label>
                  <select id="type" name="type" required className={inputClass}>
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
                <div>
                  <label htmlFor="breed" className={labelClass}>
                    Breed (optional)
                  </label>
                  <input
                    type="text"
                    name="breed"
                    id="breed"
                    placeholder="e.g. Holstein, Rhode Island Red"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="gender" className={labelClass}>
                    Gender
                  </label>
                  <select id="gender" name="gender" required className={inputClass}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:p-4 dark:max-md:border-gray-700/60">
              <h3 className={sectionTitleClass}>Growth &amp; health</h3>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div>
                  <label htmlFor="age" className={labelClass}>
                    Age (months)
                  </label>
                  <input type="number" name="age" id="age" required min="0" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="weight" className={labelClass}>
                    Weight (kg) — optional
                  </label>
                  <input type="number" name="weight" id="weight" min="0" step="0.1" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="acquisitionDate" className={labelClass}>
                    Date of acquisition
                  </label>
                  <input
                    type="date"
                    name="acquisitionDate"
                    id="acquisitionDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="healthStatus" className={labelClass}>
                    Health status
                  </label>
                  <select
                    id="healthStatus"
                    name="healthStatus"
                    required
                    defaultValue="healthy"
                    className={inputClass}
                  >
                    <option value="healthy">Healthy</option>
                    <option value="sick">Sick</option>
                    <option value="recovering">Recovering</option>
                    <option value="quarantine">Quarantine</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className={`${inputClass} max-md:min-h-[6.5rem]`}
                placeholder="Any additional details..."
              />
            </div>
          </div>

          <div className="hidden md:flex flex-row justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add livestock'}
            </button>
          </div>

          <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[25] flex gap-3 border-t border-gray-200/90 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
            <button
              type="button"
              onClick={() => router.back()}
              className="min-h-12 min-w-[5.5rem] shrink-0 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-md shadow-primary-600/25 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Beef className="h-5 w-5" />
                  Add livestock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
