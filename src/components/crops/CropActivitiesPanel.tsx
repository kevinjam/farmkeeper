'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Sprout, Trash2 } from 'lucide-react';
import CropActivityDeleteDialog from '@/components/crops/CropActivityDeleteDialog';
import CropActivityTypeIcon from '@/components/crops/CropActivityTypeIcon';
import { CROP_NOTICE, NoticeBanner } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import {
  cropActivityBody,
  cropActivityExtraNotes,
  formatCropActivityDate,
  cropActivityTypeLabel,
  type CropActivityRecord,
} from '@/lib/cropActivities';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function CropActivitiesPanel({
  farmId,
  cropId,
  cropName,
  onStatsChange,
}: {
  farmId: string;
  cropId: string;
  cropName: string;
  onStatsChange?: (stats: { count: number; lastDate: string | null }) => void;
}) {
  const { farmPath } = useFarmPaths(farmId);
  const [activities, setActivities] = useState<CropActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState<CropActivityRecord | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const addHref = farmPath(`/dashboard/crops/${cropId}/activities/add`);
  const onStatsChangeRef = useRef(onStatsChange);
  onStatsChangeRef.current = onStatsChange;

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCropActivities(farmId, cropId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load activities');
      }
      const next = (response.data || []) as CropActivityRecord[];
      setActivities(next);
      setError('');
    } catch (err) {
      console.error('Error fetching crop activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  }, [farmId, cropId]);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const orderedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateDiff =
        new Date(b.activityDate || b.date || 0).getTime() -
        new Date(a.activityDate || a.date || 0).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activities]);

  useEffect(() => {
    if (isLoading) return;
    const last = orderedActivities[0];
    onStatsChangeRef.current?.({
      count: orderedActivities.length,
      lastDate: last ? last.activityDate || last.date || last.createdAt : null,
    });
  }, [isLoading, orderedActivities]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      setIsWorking(true);
      const response = await apiClient.deleteCropActivity(farmId, cropId, pendingDelete._id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete activity');
      }
      setActivities((prev) => prev.filter((item) => item._id !== pendingDelete._id));
      setPendingDelete(null);
      setNotice(CROP_NOTICE.activityDeleted);
      setError('');
    } catch (err) {
      console.error('Error deleting crop activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
    } finally {
      setIsWorking(false);
    }
  };

  const recordButton = (
    <Link
      href={addHref}
      className="btn btn-primary inline-flex shrink-0 items-center justify-center gap-1.5 max-md:min-h-11 max-md:rounded-xl max-md:px-3 md:min-h-9"
    >
      <Plus className="h-4 w-4" strokeWidth={2} />
      <span className="hidden sm:inline">Record Activity</span>
      <span className="sm:hidden">Record</span>
    </Link>
  );

  return (
    <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Activities</h2>
          {!isLoading && orderedActivities.length > 0 ? (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {orderedActivities.length} recorded · newest first
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Work already done on this crop</p>
          )}
        </div>
        {!isLoading && orderedActivities.length > 0 ? recordButton : null}
      </div>

      <div className="px-4 py-3 md:px-5">
        {notice ? (
          <div className="mb-3">
            <NoticeBanner tone="success" onDismiss={() => setNotice('')}>
              {notice}
            </NoticeBanner>
          </div>
        ) : null}
        {error ? (
          <div className="mb-3">
            <NoticeBanner tone="error" onDismiss={() => setError('')}>
              {error}
            </NoticeBanner>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900/50"
              />
            ))}
          </div>
        ) : orderedActivities.length === 0 ? (
          <div className="flex flex-col items-center px-2 py-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              <Sprout className="h-6 w-6" strokeWidth={2} />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
              No activities recorded yet
            </p>
            <p className="mt-1 max-w-sm text-sm leading-snug text-gray-500 dark:text-gray-400">
              Log work after you do it. Use farm tasks for work that still needs doing.
            </p>
            <Link
              href={addHref}
              className="btn btn-primary mt-4 inline-flex min-h-11 items-center justify-center gap-2 px-4 max-md:w-full max-md:rounded-xl md:min-h-9"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Record First Activity
            </Link>
          </div>
        ) : (
          <ol className="divide-y divide-gray-100 dark:divide-gray-700/80">
            {orderedActivities.map((activity) => {
              const label = cropActivityTypeLabel(activity.activityType);
              const summary = cropActivityBody(cropName, activity);
              const extraNotes = cropActivityExtraNotes(activity);
              return (
                <li key={activity._id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <CropActivityTypeIcon type={activity.activityType} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{label}</h3>
                        <p className="text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">
                          {formatCropActivityDate(activity.activityDate || activity.date)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-sm leading-snug text-gray-600 dark:text-gray-300">
                        {summary}
                      </p>
                      {extraNotes ? (
                        <p className="mt-1 whitespace-pre-wrap text-xs leading-snug text-gray-500 dark:text-gray-400">
                          {extraNotes}
                        </p>
                      ) : null}
                      <div className="mt-2 flex gap-2 md:hidden">
                        <Link
                          href={farmPath(`/dashboard/crops/${cropId}/activities/${activity._id}/edit`)}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(activity)}
                          className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 dark:border-red-900/50 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="hidden shrink-0 items-center gap-0.5 md:flex">
                      <Link
                        href={farmPath(`/dashboard/crops/${cropId}/activities/${activity._id}/edit`)}
                        className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-300"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(activity)}
                        className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {pendingDelete ? (
        <CropActivityDeleteDialog
          isWorking={isWorking}
          onClose={() => setPendingDelete(null)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
