'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Leaf,
  MapPinned,
  Plus,
  Sprout,
  Trash2,
} from 'lucide-react';
import AddCropModal from '@/components/AddCropModal';
import { apiClient } from '@/lib/api';

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

function shortId(id: string) {
  if (id.length <= 14) return id;
  return `…${id.slice(-8)}`;
}

function formatCropTypeLabel(cropType: string) {
  return cropType.replace(/_/g, ' ');
}

export default function CropsDashboard({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const fetchCrops = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCrops(farmId);

      if (response.success) {
        setCrops(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch crops');
      }
    } catch (err) {
      console.error('Error fetching crops:', err);
      setError('Failed to fetch crops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (cropId: string) => {
    try {
      const response = await apiClient.deleteCrop(farmId, cropId);

      if (response.success) {
        setCrops(crops.filter((crop) => crop._id !== cropId));
        setDeleteConfirm(null);
      } else {
        setError(response.error || 'Failed to delete crop');
      }
    } catch (err) {
      console.error('Error deleting crop:', err);
      setError('Failed to delete crop');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200';
      case 'harvested':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100';
      case 'planted':
        return 'bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200';
      case 'planned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [farmId]);

  const totalCrops = crops.length;
  const activeCrops = crops.filter((c) => ['planted', 'growing'].includes(c.status)).length;
  const totalAreaSum = crops.reduce((sum, crop) => sum + crop.area, 0);

  if (error) {
    return (
      <div className="max-md:mx-3 max-md:mt-2 max-md:pb-[calc(6rem+env(safe-area-inset-bottom))] md:max-w-5xl md:mx-auto md:py-8 md:px-6 lg:px-8">
        <div
          className="rounded-2xl border border-red-200/80 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40 md:rounded-lg"
          role="alert"
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
          <button
            type="button"
            onClick={fetchCrops}
            className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-2 hover:no-underline dark:text-red-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const openAddModal = () => setIsAddModalOpen(true);

  const emptyList = (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center dark:border-gray-600 dark:bg-gray-900/40">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
        <Sprout className="h-7 w-7" strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">No crops yet</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Add your first crop to see it listed here.
      </p>
      <button
        type="button"
        onClick={openAddModal}
        className="btn btn-primary mt-5 inline-flex items-center justify-center gap-2 max-md:min-h-12 max-md:w-full max-md:rounded-xl"
      >
        <Plus className="h-5 w-5" strokeWidth={2} />
        Add your first crop
      </button>
    </div>
  );

  return (
    <>
    <div className="flex flex-col gap-4 max-md:px-0 md:max-w-5xl md:mx-auto md:gap-6 md:py-8 md:px-6 lg:px-8 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="order-1 overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="max-md:bg-gradient-to-br max-md:from-emerald-500/12 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-emerald-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:flex-col md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex max-md:items-start max-md:gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 md:hidden">
                <Sprout className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Crops</h1>
                <p className="mt-0.5 text-[13px] leading-snug text-gray-600 dark:text-gray-300 md:mt-1 md:text-sm">
                  Plan fields, track growth, and review your harvest pipeline
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="btn btn-primary mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 max-md:min-h-12 max-md:rounded-xl md:mt-0 md:w-auto"
            >
              <Plus className="h-5 w-5 md:h-4 md:w-4" strokeWidth={2} />
              Add crop
            </button>
          </div>
        </div>
      </div>

      {/* Overview — mobile-first tiles (desktop overview block follows list below) */}
      <div className="order-2 grid grid-cols-2 gap-2 px-3 md:hidden">
        <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 via-white to-white p-3 shadow-md dark:from-emerald-500/16 dark:via-gray-900 dark:to-gray-900/95 dark:border-emerald-500/25">
          <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-emerald-500/50 opacity-90" />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total crops
          </p>
          <p className="mt-1 text-[1.35rem] font-extrabold tabular-nums text-emerald-950 dark:text-emerald-100">
            {isLoading ? '—' : totalCrops}
          </p>
          <p className="mt-auto text-[10px] font-medium text-gray-500 dark:text-gray-400">All records</p>
        </div>
        <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-green-500/25 bg-gradient-to-br from-green-500/10 via-white to-white p-3 shadow-md dark:from-green-500/14 dark:via-gray-900 dark:to-gray-900/95 dark:border-green-500/20">
          <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-green-500/45 opacity-90" />
          <div className="flex items-start justify-between gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Active
            </p>
            <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" strokeWidth={2} />
          </div>
          <p className="mt-1 text-[1.35rem] font-extrabold tabular-nums text-green-700 dark:text-green-300">
            {isLoading ? '—' : activeCrops}
          </p>
          <p className="mt-auto text-[10px] font-medium text-gray-500 dark:text-gray-400">Planted / growing</p>
        </div>
        <div className="relative col-span-2 flex min-h-[5.5rem] flex-col rounded-xl border border-amber-400/35 bg-gradient-to-br from-amber-400/12 via-white to-white p-3 shadow-md dark:from-amber-500/14 dark:via-gray-900 dark:to-gray-900/95 dark:border-amber-500/25">
          <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-amber-500/50 opacity-90" />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total area
          </p>
          <p className="mt-1 text-[1.25rem] font-extrabold tabular-nums text-amber-900 dark:text-amber-100">
            {isLoading ? '—' : `${totalAreaSum.toFixed(1)}`}
            {!isLoading && (
              <span className="text-base font-bold text-amber-700/90 dark:text-amber-200/90"> acres</span>
            )}
          </p>
        </div>
      </div>

      {/* Crop list */}
      <div className="order-3 md:order-2 max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white max-md:p-4 max-md:shadow-md dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800 md:bg-white md:rounded-xl md:shadow-lg md:p-6 dark:md:bg-gray-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white md:text-lg md:font-semibold mb-4">
          Current crops
        </h2>

        {isLoading ? (
          <>
            <div className="space-y-3 md:hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl border border-gray-200/80 bg-gray-100/80 animate-pulse dark:border-gray-700 dark:bg-gray-900/50"
                />
              ))}
            </div>
            <div className="hidden md:block animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
          </>
        ) : crops.length === 0 ? (
          emptyList
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {crops.map((crop) => (
                <div
                  key={crop._id}
                  className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700/80 dark:bg-gray-800/90"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-gray-900 dark:text-white">{crop.name}</p>
                      {crop.variety && (
                        <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-300">{crop.variety}</p>
                      )}
                      <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400">{shortId(crop._id)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(crop.status)}`}
                    >
                      {crop.status}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Type</dt>
                      <dd className="mt-0.5 capitalize text-gray-900 dark:text-gray-100">
                        {formatCropTypeLabel(crop.cropType)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Area</dt>
                      <dd className="mt-0.5 text-gray-900 dark:text-white">
                        {crop.area} {crop.areaUnit}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Planted</dt>
                      <dd className="mt-0.5">{formatDate(crop.plantedDate)}</dd>
                    </div>
                    {crop.location && (
                      <div className="col-span-2 flex items-start gap-1.5">
                        <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <dd>{crop.location}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700/80">
                    <Link
                      href={`/${farmId}/dashboard/crops/${crop._id}`}
                      className="inline-flex flex-1 min-w-[5.5rem] items-center justify-center gap-1 rounded-xl bg-primary-600 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm active:scale-[0.98] dark:bg-primary-500"
                    >
                      View
                      <ChevronRight className="h-4 w-4 opacity-90" />
                    </Link>
                    <Link
                      href={`/${farmId}/dashboard/crops/${crop._id}/edit`}
                      className="inline-flex flex-1 min-w-[5.5rem] items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-gray-800 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ id: crop._id, name: crop.name })}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 active:scale-[0.98] dark:border-red-900/50 dark:text-red-400"
                      aria-label={`Delete ${crop.name}`}
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Area
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Planted
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
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
                        {formatCropTypeLabel(crop.cropType)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {crop.area} {crop.areaUnit}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(crop.status)}`}
                        >
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
                          type="button"
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
          </>
        )}
      </div>

      <div className="order-4 hidden md:order-3 md:block">
        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Crop overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Total crops</h3>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalCrops}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Active crops</h3>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeCrops}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Total area</h3>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {totalAreaSum.toFixed(1)} acres
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-crop-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 dark:bg-black/60"
            aria-label="Dismiss"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-md rounded-t-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/70">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
            </div>
            <h3 id="delete-crop-title" className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
              Delete crop?
            </h3>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete &quot;{deleteConfirm.name}&quot;? This cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-center">
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.id)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white active:scale-[0.98] dark:bg-red-500 sm:w-auto sm:min-w-[8rem]"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto sm:min-w-[8rem]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <AddCropModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        farmId={farmId}
        onSuccess={() => {
          fetchCrops();
        }}
      />
    </>
  );
}
