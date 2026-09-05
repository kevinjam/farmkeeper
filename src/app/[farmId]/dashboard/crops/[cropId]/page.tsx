'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, Coffee, Pencil, Sprout, Trash2 } from 'lucide-react';
import CropActivitiesPanel from '@/components/crops/CropActivitiesPanel';
import CropExpensesPanel from '@/components/crops/CropExpensesPanel';
import CropHarvestSalesPanel from '@/components/crops/CropHarvestSalesPanel';
import CropInsightsPanel from '@/components/crops/CropInsightsPanel';
import CropProfitabilityPanel from '@/components/crops/CropProfitabilityPanel';
import CropRemoveDialog from '@/components/crops/CropRemoveDialog';
import { CROP_NOTICE, NoticeBanner, setFlashNotice, useFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { formatCropActivityDate } from '@/lib/cropActivities';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  cropFieldName,
  cropPlantingDate,
  cropStatusBadgeClass,
  formatCropArea,
  formatCropDate,
  formatCropStatusLabel,
  formatCropTypeLabel,
  type CropRecord,
} from '@/lib/crops';

function MetaCell({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white px-3 py-2.5 dark:bg-gray-800 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
        {children}
      </div>
    </div>
  );
}

export default function CropView({ params }: { params: { farmId: string; cropId: string } }) {
  const { farmId, cropId } = params;
  const router = useRouter();
  const { farmPath } = useFarmPaths(farmId);
  const [crop, setCrop] = useState<CropRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [activityStats, setActivityStats] = useState<{ count: number; lastDate: string | null } | null>(null);
  const { message: notice, setMessage: setNotice, clear: clearNotice } = useFlashNotice();

  const fetchCrop = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCrop(farmId, cropId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Crop not found');
      }
      setCrop(response.data as CropRecord);
      setError(null);
    } catch (err) {
      console.error('Error fetching crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to load crop');
      setCrop(null);
    } finally {
      setIsLoading(false);
    }
  }, [farmId, cropId]);

  const handleArchive = async (archived: boolean) => {
    try {
      setIsWorking(true);
      setActionError(null);
      const response = await apiClient.updateCrop(farmId, cropId, { archived });
      if (!response.success) {
        throw new Error(response.error || 'Failed to update crop');
      }
      setCrop((prev) => (prev ? { ...prev, archived } : prev));
      setRemoveOpen(false);
      setNotice(archived ? CROP_NOTICE.archived : CROP_NOTICE.restored);
    } catch (err) {
      console.error('Error updating crop:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to update crop');
    } finally {
      setIsWorking(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsWorking(true);
      setActionError(null);
      const response = await apiClient.deleteCrop(farmId, cropId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete crop');
      }
      setFlashNotice(CROP_NOTICE.deleted);
      router.push(farmPath('/dashboard/crops'));
    } catch (err) {
      console.error('Error deleting crop:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to delete crop');
      setIsWorking(false);
      setRemoveOpen(false);
    }
  };

  useEffect(() => {
    void fetchCrop();
  }, [fetchCrop]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 max-md:pb-[calc(6rem+env(safe-area-inset-bottom))] md:py-2">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-36 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 lg:col-span-8" />
          <div className="hidden h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 lg:col-span-4 lg:block" />
        </div>
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="max-md:mt-2 max-md:pb-[calc(6rem+env(safe-area-inset-bottom))] md:py-2">
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

  const TypeIcon = crop.cropType === 'coffee' ? Coffee : Sprout;
  const fieldName = cropFieldName(crop);
  const plantingDate = cropPlantingDate(crop);
  const activityCount = activityStats?.count ?? crop.activityCount ?? 0;
  const lastActivity = activityStats ? activityStats.lastDate : crop.lastActivityDate;
  const typeBits = [formatCropTypeLabel(crop.cropType), crop.variety, formatCropArea(crop.area, crop.areaUnit)]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col gap-3 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      {notice ? (
        <NoticeBanner tone="success" onDismiss={clearNotice}>
          {notice}
        </NoticeBanner>
      ) : null}
      {actionError ? (
        <NoticeBanner tone="error" onDismiss={() => setActionError(null)}>
          {actionError}
        </NoticeBanner>
      ) : null}

      <Link
        href={farmPath('/dashboard/crops')}
        className="w-fit text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400"
      >
        ← Back to crops
      </Link>

      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between md:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              <TypeIcon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold text-gray-900 dark:text-white md:text-xl">
                  {crop.name}
                </h1>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cropStatusBadgeClass(crop.status)}`}
                >
                  {formatCropStatusLabel(crop.status)}
                </span>
                {crop.archived ? (
                  <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/60 dark:text-amber-100">
                    Archived
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-[13px] text-gray-500 dark:text-gray-400">{typeBits}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 max-sm:w-full">
            <Link
              href={farmPath(`/dashboard/crops/${cropId}/edit`)}
              className="btn btn-primary inline-flex flex-1 items-center justify-center gap-1.5 max-md:min-h-11 max-md:rounded-xl max-md:px-3 sm:flex-none md:min-h-9"
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setRemoveOpen(true)}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border bg-white text-sm font-semibold hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 max-md:min-h-11 max-md:px-3 sm:flex-none md:min-h-9 md:rounded-lg md:px-3 ${
                crop.archived
                  ? 'border-red-200 text-red-700 dark:border-red-900/50 dark:text-red-300'
                  : 'border-amber-200 text-amber-800 dark:border-amber-800 dark:text-amber-200'
              }`}
            >
              {crop.archived ? (
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Archive className="h-4 w-4" strokeWidth={2} />
              )}
              {crop.archived ? 'Remove' : 'Archive'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700 lg:grid-cols-5">
          <MetaCell label="Field">{fieldName || 'Not assigned'}</MetaCell>
          <MetaCell label="Planting">{formatCropDate(plantingDate)}</MetaCell>
          <MetaCell label="Harvest">{formatCropDate(crop.expectedHarvestDate)}</MetaCell>
          <MetaCell label="Activities">{activityCount}</MetaCell>
          <MetaCell label="Last activity" className="col-span-2 lg:col-span-1">
            {activityCount ? formatCropActivityDate(lastActivity) : '—'}
          </MetaCell>
        </div>

        {crop.notes ? (
          <div className="border-t border-gray-200 px-4 py-2.5 dark:border-gray-700 md:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Notes
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm leading-snug text-gray-700 dark:text-gray-300">
              {crop.notes}
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-start">
        <div className="order-2 lg:order-1 lg:col-span-8">
          <CropActivitiesPanel
            farmId={farmId}
            cropId={cropId}
            cropName={crop.name}
            onStatsChange={setActivityStats}
          />
        </div>
        <CropInsightsPanel
          farmId={farmId}
          cropId={cropId}
          className="order-1 lg:order-2 lg:col-span-4"
        />
      </div>

      <CropHarvestSalesPanel farmId={farmId} cropId={cropId} />
      <CropProfitabilityPanel farmId={farmId} cropId={cropId} />
      <CropExpensesPanel farmId={farmId} cropId={cropId} />

      {removeOpen ? (
        <CropRemoveDialog
          cropName={crop.name}
          archived={Boolean(crop.archived)}
          isWorking={isWorking}
          onClose={() => setRemoveOpen(false)}
          onArchive={() => void handleArchive(true)}
          onRestore={() => void handleArchive(false)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
