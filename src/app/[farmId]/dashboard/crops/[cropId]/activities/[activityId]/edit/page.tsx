'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil } from 'lucide-react';
import CropActivityTypePicker from '@/components/crops/CropActivityTypePicker';
import { CROP_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { validateCropActivityForm, type CropActivityRecord } from '@/lib/cropActivities';
import { cropFormInputClass, toDateInput } from '@/lib/crops';
import { useFarmPaths } from '@/hooks/useFarmPaths';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const hintClass = 'mt-1 text-xs text-gray-500 dark:text-gray-400';
const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';

function fieldClass(hasError: boolean) {
  return `${cropFormInputClass} mt-1.5 ${
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500' : ''
  }`;
}

export default function EditCropActivityPage({
  params,
}: {
  params: { farmId: string; cropId: string; activityId: string };
}) {
  const { farmId, cropId, activityId } = params;
  const router = useRouter();
  const { farmPath } = useFarmPaths(farmId);
  const cropHref = farmPath(`/dashboard/crops/${cropId}`);
  const [activityType, setActivityType] = useState('');
  const [otherType, setOtherType] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const fetchActivity = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCropActivity(farmId, cropId, activityId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Activity not found');
      }
      const activity = response.data as CropActivityRecord;
      setActivityType(activity.activityType);
      setOtherType(activity.otherType || '');
      setActivityDate(toDateInput(activity.activityDate || activity.date));
      setDescription(activity.description || activity.notes || '');
      setNotes(activity.description ? activity.notes || '' : '');
      setError('');
    } catch (err) {
      console.error('Error fetching crop activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  }, [farmId, cropId, activityId]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const errors = validateCropActivityForm({
      activityType,
      otherType,
      activityDate,
      description,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted fields and try again.');
      const firstKey = Object.keys(errors)[0];
      requestAnimationFrame(() => {
        document.getElementById(firstKey)?.focus();
        document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.updateCropActivity(farmId, cropId, activityId, {
        activityType,
        otherType: activityType === 'other' ? otherType.trim() : '',
        activityDate,
        description: description.trim(),
        notes: notes.trim(),
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to update activity');
      }
      setFlashNotice(CROP_NOTICE.activityUpdated);
      router.push(cropHref);
    } catch (err) {
      console.error('Error updating crop activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update activity');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (error && !activityType) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/40">
          <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
          <div className="mt-4 flex gap-3">
            <Link href={cropHref} className="text-sm font-semibold underline">
              Back to crop
            </Link>
            <button type="button" onClick={() => void fetchActivity()} className="text-sm font-semibold underline">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl max-md:max-w-full max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 dark:border-gray-700 max-md:border-gray-200/80 max-md:bg-gradient-to-br max-md:from-emerald-500/10 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-emerald-500/10 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <Link
            href={cropHref}
            className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400"
          >
            ← Back to crop
          </Link>
          <div className="mt-3 flex max-md:items-start max-md:gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 md:hidden">
              <Pencil className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white max-md:text-lg max-md:leading-tight">
                Edit Activity
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-md:mt-0.5 max-md:text-[13px]">
                Update this record of work already done.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="space-y-5 p-6 max-md:space-y-4 max-md:p-4">
            {error ? (
              <NoticeBanner tone="error" onDismiss={() => setError('')}>
                {error}
              </NoticeBanner>
            ) : null}

            <div>
              <CropActivityTypePicker
                value={activityType}
                hasError={Boolean(fieldErrors.activityType)}
                onChange={(next) => {
                  setActivityType(next);
                  clearFieldError('activityType');
                  clearFieldError('otherType');
                }}
              />
              {fieldErrors.activityType ? (
                <p className={errorClass}>{fieldErrors.activityType}</p>
              ) : null}
            </div>

            {activityType === 'other' ? (
              <div>
                <label htmlFor="otherType" className={labelClass}>
                  Specify activity
                </label>
                <input
                  type="text"
                  id="otherType"
                  name="otherType"
                  value={otherType}
                  maxLength={40}
                  onChange={(e) => {
                    setOtherType(e.target.value);
                    clearFieldError('otherType');
                  }}
                  placeholder="e.g. Mulching"
                  aria-invalid={Boolean(fieldErrors.otherType)}
                  className={fieldClass(Boolean(fieldErrors.otherType))}
                />
                {fieldErrors.otherType ? <p className={errorClass}>{fieldErrors.otherType}</p> : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="activityDate" className={labelClass}>
                Date this was done
              </label>
              <input
                type="date"
                id="activityDate"
                name="activityDate"
                value={activityDate}
                onChange={(e) => {
                  setActivityDate(e.target.value);
                  clearFieldError('activityDate');
                }}
                aria-invalid={Boolean(fieldErrors.activityDate)}
                className={fieldClass(Boolean(fieldErrors.activityDate))}
              />
              {fieldErrors.activityDate ? (
                <p className={errorClass}>{fieldErrors.activityDate}</p>
              ) : (
                <p className={hintClass}>The day the work happened, not a due date.</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearFieldError('description');
                }}
                aria-invalid={Boolean(fieldErrors.description)}
                className={`${fieldClass(Boolean(fieldErrors.description))} max-md:min-h-[6.5rem]`}
                placeholder="Removed weeds around the coffee plants."
              />
              {fieldErrors.description ? (
                <p className={errorClass}>{fieldErrors.description}</p>
              ) : (
                <p className={hintClass}>Required. A short note of what was done.</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className={labelClass}>
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                maxLength={1000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${cropFormInputClass} mt-1.5 max-md:min-h-[5rem]`}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="hidden md:flex flex-row justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={() => router.push(cropHref)}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>

          <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[25] flex gap-3 border-t border-gray-200/90 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
            <button
              type="button"
              onClick={() => router.push(cropHref)}
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
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
