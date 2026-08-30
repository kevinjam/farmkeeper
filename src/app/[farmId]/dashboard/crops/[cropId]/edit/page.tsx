'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { CROP_STATUSES, CROP_TYPES, toDateInput, YIELD_UNITS } from '@/lib/crops';

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
}

const inputClass =
  'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

export default function EditCrop({ params }: { params: { farmId: string; cropId: string } }) {
  const { farmId, cropId } = params;
  const router = useRouter();
  const { farmPath } = useFarmPaths(farmId);

  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('');
  const [variety, setVariety] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [status, setStatus] = useState('planned');
  const [plantedDate, setPlantedDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [actualHarvestDate, setActualHarvestDate] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldUnit, setYieldUnit] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCrop = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCrop(farmId, cropId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Crop not found');
      }
      const crop = response.data as Crop;
      setName(crop.name);
      setCropType(crop.cropType);
      setVariety(crop.variety || '');
      setArea(String(crop.area));
      setAreaUnit(crop.areaUnit || 'acres');
      setStatus(crop.status || 'planned');
      setPlantedDate(toDateInput(crop.plantedDate));
      setExpectedHarvestDate(toDateInput(crop.expectedHarvestDate));
      setActualHarvestDate(toDateInput(crop.actualHarvestDate));
      setYieldAmount(crop.yield != null ? String(crop.yield) : '');
      setYieldUnit(crop.yieldUnit || '');
      setLocation(crop.location || '');
      setNotes(crop.notes || '');
      setError('');
    } catch (err) {
      console.error('Error fetching crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to load crop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await apiClient.updateCrop(farmId, cropId, {
        name: name.trim(),
        cropType,
        variety: variety.trim() || undefined,
        area: parseFloat(area),
        areaUnit,
        status,
        plantedDate: plantedDate || undefined,
        expectedHarvestDate: expectedHarvestDate || undefined,
        actualHarvestDate: actualHarvestDate || undefined,
        yield: yieldAmount ? parseFloat(yieldAmount) : undefined,
        yieldUnit: yieldUnit || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update crop');
      }
      router.push(farmPath(`/dashboard/crops/${cropId}`));
    } catch (err) {
      console.error('Error updating crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to update crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    void fetchCrop();
  }, [farmId, cropId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/40">
          <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
          <div className="mt-4 flex gap-3">
            <Link href={farmPath('/dashboard/crops')} className="text-sm font-semibold underline">
              Back to crops
            </Link>
            <button type="button" onClick={() => void fetchCrop()} className="text-sm font-semibold underline">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl max-md:pb-8 md:py-2">
      <Link
        href={farmPath(`/dashboard/crops/${cropId}`)}
        className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400"
      >
        ← Back to crop
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Edit crop</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">Update this crop and save your changes.</p>

      <div className="mt-6 rounded-2xl bg-white shadow dark:bg-gray-800">
        {error ? (
          <div className="border-l-4 border-red-400 bg-red-50 px-6 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-5 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Crop name *
            </label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="cropType" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Crop type *
            </label>
            <select id="cropType" value={cropType} onChange={(e) => setCropType(e.target.value)} required className={inputClass}>
              <option value="">Select type</option>
              {CROP_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="variety" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Variety
            </label>
            <input id="variety" value={variety} onChange={(e) => setVariety(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="area" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Area *
            </label>
            <input
              id="area"
              type="number"
              min="0"
              step="0.1"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="areaUnit" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Area unit
            </label>
            <select id="areaUnit" value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className={inputClass}>
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {CROP_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="plantedDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Planted date
            </label>
            <input id="plantedDate" type="date" value={plantedDate} onChange={(e) => setPlantedDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="expectedHarvestDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expected harvest
            </label>
            <input
              id="expectedHarvestDate"
              type="date"
              value={expectedHarvestDate}
              onChange={(e) => setExpectedHarvestDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="actualHarvestDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Actual harvest
            </label>
            <input
              id="actualHarvestDate"
              type="date"
              value={actualHarvestDate}
              onChange={(e) => setActualHarvestDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="yield" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Yield
            </label>
            <input
              id="yield"
              type="number"
              min="0"
              step="0.1"
              value={yieldAmount}
              onChange={(e) => setYieldAmount(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="yieldUnit" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Yield unit
            </label>
            <select id="yieldUnit" value={yieldUnit} onChange={(e) => setYieldUnit(e.target.value)} className={inputClass}>
              <option value="">Select unit</option>
              {YIELD_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location / field
            </label>
            <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-5 dark:border-gray-700 md:col-span-2 sm:flex-row sm:justify-end">
            <Link
              href={farmPath(`/dashboard/crops/${cropId}`)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!name || !cropType || !area || isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
