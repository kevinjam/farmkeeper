'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Sprout } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  cropStatusBadgeClass,
  formatCropArea,
  formatCropStatusLabel,
  formatCropTypeLabel,
  type CropRecord,
} from '@/lib/crops';

const PREVIEW_LIMIT = 3;

const STATUS_ORDER: Record<string, number> = {
  harvesting: 0,
  growing: 1,
  planted: 1,
  planned: 2,
  harvested: 3,
  completed: 4,
  failed: 5,
};

function sortCropsForDashboard(crops: CropRecord[]) {
  return [...crops].sort((a, b) => {
    const statusDiff = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    return a.name.localeCompare(b.name);
  });
}

export default function YourCropsCard({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCrops = useCallback(async () => {
    if (!farmId) return;
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.getCrops(farmId);
      if (!response.success) {
        throw new Error(response.error || 'Could not load crops');
      }
      setCrops(sortCropsForDashboard((response.data || []) as CropRecord[]));
    } catch (err) {
      console.error('Error fetching dashboard crops:', err);
      setError(err instanceof Error ? err.message : 'Could not load crops');
      setCrops([]);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    void fetchCrops();
  }, [fetchCrops]);

  const preview = crops.slice(0, PREVIEW_LIMIT);
  const extraCount = Math.max(0, crops.length - preview.length);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-100/90 max-md:shadow-md dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Sprout className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Your Crops</h3>
            <p className="truncate text-[11px] text-gray-500">
              {loading ? 'Loading…' : crops.length === 0 ? 'No crops yet' : `${crops.length} on this farm`}
            </p>
          </div>
        </div>
        {!loading && crops.length > 0 ? (
          <Link
            href={farmPath('/dashboard/crops')}
            className="shrink-0 text-xs font-semibold text-primary-600 dark:text-primary-400"
          >
            View all
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-2 px-4 py-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-8 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/70" />
          ))}
        </div>
      ) : error ? (
        <div className="px-4 py-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
          <button
            type="button"
            onClick={() => void fetchCrops()}
            className="mt-2 text-xs font-semibold text-primary-600 dark:text-primary-400"
          >
            Try again
          </button>
        </div>
      ) : crops.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center px-4 py-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Start tracking crops</p>
          <p className="mt-0.5 text-xs text-gray-500">Add a field or planting next to your livestock.</p>
          <Link
            href={farmPath('/dashboard/crops/add')}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add crop
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700/80">
          {preview.map((crop) => (
            <li key={crop._id}>
              <Link
                href={farmPath(`/dashboard/crops/${crop._id}`)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <p className="min-w-0 truncate text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{formatCropTypeLabel(crop.cropType)}</span>
                  <span className="text-gray-400"> · </span>
                  <span className="text-gray-500">{formatCropArea(crop.area, crop.areaUnit).toLowerCase()}</span>
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cropStatusBadgeClass(crop.status)}`}
                >
                  {formatCropStatusLabel(crop.status)}
                </span>
              </Link>
            </li>
          ))}
          {extraCount > 0 ? (
            <li className="px-4 py-2">
              <Link
                href={farmPath('/dashboard/crops')}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400"
              >
                +{extraCount} more
              </Link>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
