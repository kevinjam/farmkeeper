'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { formatCropTypeLabel } from '@/lib/crops';

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
}

function getStatusColor(status: string) {
  switch (status) {
    case 'growing':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200';
    case 'harvested':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100';
    case 'planted':
      return 'bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CropView({ params }: { params: { farmId: string; cropId: string } }) {
  const { farmId, cropId } = params;
  const router = useRouter();
  const { farmPath } = useFarmPaths(farmId);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCrop = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCrop(farmId, cropId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Crop not found');
      }
      setCrop(response.data as Crop);
      setError(null);
    } catch (err) {
      console.error('Error fetching crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to load crop');
      setCrop(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await apiClient.deleteCrop(farmId, cropId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete crop');
      }
      router.push(farmPath('/dashboard/crops'));
    } catch (err) {
      console.error('Error deleting crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete crop');
      setIsDeleting(false);
      setDeleteConfirm(false);
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
          <div className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/40">
          <p className="font-medium text-red-800 dark:text-red-200">{error || 'Crop not found'}</p>
          <div className="mt-4 flex gap-3">
            <Link href={farmPath('/dashboard/crops')} className="text-sm font-semibold text-red-800 underline dark:text-red-200">
              Back to crops
            </Link>
            <button type="button" onClick={() => void fetchCrop()} className="text-sm font-semibold text-red-800 underline dark:text-red-200">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl max-md:pb-8 md:py-2">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={farmPath('/dashboard/crops')}
            className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400"
          >
            ← Back to crops
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{crop.name}</h1>
          {crop.variety ? <p className="text-gray-600 dark:text-gray-400">{crop.variety}</p> : null}
        </div>
        <div className="flex gap-2">
          <Link
            href={farmPath(`/dashboard/crops/${cropId}/edit`)}
            className="inline-flex min-h-11 items-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex min-h-11 items-center rounded-xl border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 dark:border-red-700 dark:bg-gray-800 dark:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Crop details</h2>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Basic</h3>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium capitalize text-gray-900 dark:text-white">{formatCropTypeLabel(crop.cropType)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(crop.status)}`}>
                {crop.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Area</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {crop.area} {crop.areaUnit}
              </p>
            </div>
            {crop.location ? (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{crop.location}</p>
              </div>
            ) : null}
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dates</h3>
            <div>
              <p className="text-sm text-gray-500">Planted</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(crop.plantedDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expected harvest</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(crop.expectedHarvestDate)}</p>
            </div>
            {crop.actualHarvestDate ? (
              <div>
                <p className="text-sm text-gray-500">Actual harvest</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(crop.actualHarvestDate)}</p>
              </div>
            ) : null}
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Record</h3>
            {crop.yield != null ? (
              <div>
                <p className="text-sm text-gray-500">Yield</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {crop.yield} {crop.yieldUnit || 'units'}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(crop.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(crop.updatedAt)}</p>
            </div>
          </div>
        </div>
        {crop.notes ? (
          <div className="border-t border-gray-200 px-6 py-5 dark:border-gray-700">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</h3>
            <p className="mt-2 whitespace-pre-wrap text-gray-900 dark:text-white">{crop.notes}</p>
          </div>
        ) : null}
      </div>

      {deleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl dark:bg-gray-800 sm:rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete {crop.name}?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">This cannot be undone.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirm(false)}
                className="min-h-11 rounded-xl border border-gray-300 px-4 text-sm font-semibold dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
                className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
