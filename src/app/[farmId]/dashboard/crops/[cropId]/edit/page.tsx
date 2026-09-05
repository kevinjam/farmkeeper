'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil } from 'lucide-react';
import FieldSelect from '@/components/crops/FieldSelect';
import { CROP_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  CROP_STATUSES,
  CROP_TYPES,
  cropFieldId,
  cropFormInputClass,
  formatCropTypeLabel,
  resolveCropTypeForSubmit,
  toDateInput,
  validateCropForm,
  type CropRecord,
  type FarmField,
} from '@/lib/crops';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const sectionTitleClass =
  'text-lg font-semibold text-gray-900 dark:text-white max-md:text-base max-md:font-bold';
const hintClass = 'mt-1 text-xs text-gray-500 dark:text-gray-400';
const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';

function fieldClass(hasError: boolean) {
  return `${cropFormInputClass} mt-1.5 ${
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500' : ''
  }`;
}

export default function EditCrop({ params }: { params: { farmId: string; cropId: string } }) {
  const { farmId, cropId } = params;
  const router = useRouter();
  const { farmPath } = useFarmPaths(farmId);

  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('');
  const [cropTypeOther, setCropTypeOther] = useState('');
  const [variety, setVariety] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [status, setStatus] = useState('planned');
  const [plantedDate, setPlantedDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [fields, setFields] = useState<FarmField[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const knownType = CROP_TYPES.some((type) => type.value === cropType);

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const fetchCrop = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cropResponse, fieldsResponse] = await Promise.all([
        apiClient.getCrop(farmId, cropId),
        apiClient.getFields(farmId),
      ]);
      if (!cropResponse.success || !cropResponse.data) {
        throw new Error(cropResponse.error || 'Crop not found');
      }
      const crop = cropResponse.data as CropRecord;
      const loadedFields = (fieldsResponse.success ? fieldsResponse.data || [] : []) as FarmField[];
      setName(crop.name);
      setCropType(crop.cropType);
      setCropTypeOther('');
      setVariety(crop.variety || '');
      setArea(String(crop.area));
      setAreaUnit(crop.areaUnit || 'acres');
      setStatus(crop.status || 'planned');
      setPlantedDate(toDateInput(crop.plantedDate));
      setExpectedHarvestDate(toDateInput(crop.expectedHarvestDate));
      setNotes(crop.notes || '');
      setFields(loadedFields);
      const existingFieldId = cropFieldId(crop.fieldId);
      if (existingFieldId) {
        setFieldId(existingFieldId);
      } else if (crop.location) {
        const match = loadedFields.find(
          (field) => field.name.toLowerCase() === crop.location!.trim().toLowerCase()
        );
        setFieldId(match?._id || '');
      } else {
        setFieldId('');
      }
      setError('');
    } catch (err) {
      console.error('Error fetching crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to load crop');
    } finally {
      setIsLoading(false);
    }
  }, [farmId, cropId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = validateCropForm({
      name,
      cropType,
      cropTypeOther,
      area,
      plantedDate,
      expectedHarvestDate,
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
      const response = await apiClient.updateCrop(farmId, cropId, {
        name: name.trim(),
        cropType: resolveCropTypeForSubmit(cropType, cropTypeOther),
        cropTypeOther: cropType === 'other' ? cropTypeOther.trim() : undefined,
        variety: variety.trim() || undefined,
        area: parseFloat(area),
        areaUnit,
        status,
        plantedDate: plantedDate || undefined,
        expectedHarvestDate: expectedHarvestDate || undefined,
        fieldId: fieldId || '',
        location: fieldId ? undefined : '',
        notes: notes.trim() || undefined,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update crop');
      }
      setFlashNotice(CROP_NOTICE.updated);
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
  }, [fetchCrop]);

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
    <div className="mx-auto max-w-4xl max-md:max-w-full max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 dark:border-gray-700 max-md:border-gray-200/80 max-md:bg-gradient-to-br max-md:from-emerald-500/10 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-emerald-500/10 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <Link
            href={farmPath(`/dashboard/crops/${cropId}`)}
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
                Edit crop
              </h1>
              <p className="mt-1 break-words text-sm text-gray-500 dark:text-gray-400 max-md:mt-0.5 max-md:text-[13px]">
                Update {name || 'this crop'} and save your changes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="space-y-6 p-6 max-md:space-y-5 max-md:p-4">
            {error ? (
              <NoticeBanner tone="error" onDismiss={() => setError('')}>
                {error}
              </NoticeBanner>
            ) : null}

            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:bg-gray-50/80 max-md:p-4 dark:max-md:border-gray-700/60 dark:max-md:bg-gray-900/40">
              <h3 className={sectionTitleClass}>Crop details</h3>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className={labelClass}>
                    Crop name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError('name');
                    }}
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={fieldClass(Boolean(fieldErrors.name))}
                  />
                  {fieldErrors.name ? <p className={errorClass}>{fieldErrors.name}</p> : null}
                </div>
                <div>
                  <label htmlFor="cropType" className={labelClass}>
                    Crop type
                  </label>
                  <select
                    id="cropType"
                    value={cropType}
                    onChange={(e) => {
                      setCropType(e.target.value);
                      clearFieldError('cropType');
                      clearFieldError('cropTypeOther');
                    }}
                    aria-invalid={Boolean(fieldErrors.cropType)}
                    className={fieldClass(Boolean(fieldErrors.cropType))}
                  >
                    <option value="">Select type</option>
                    {CROP_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                    {cropType && !knownType ? (
                      <option value={cropType}>{formatCropTypeLabel(cropType)}</option>
                    ) : null}
                  </select>
                  {fieldErrors.cropType ? <p className={errorClass}>{fieldErrors.cropType}</p> : null}
                </div>
                {cropType === 'other' ? (
                  <div>
                    <label htmlFor="cropTypeOther" className={labelClass}>
                      Specify crop type
                    </label>
                    <input
                      id="cropTypeOther"
                      value={cropTypeOther}
                      maxLength={40}
                      onChange={(e) => {
                        setCropTypeOther(e.target.value);
                        clearFieldError('cropTypeOther');
                      }}
                      placeholder="e.g. Sorghum"
                      aria-invalid={Boolean(fieldErrors.cropTypeOther)}
                      className={fieldClass(Boolean(fieldErrors.cropTypeOther))}
                    />
                    {fieldErrors.cropTypeOther ? <p className={errorClass}>{fieldErrors.cropTypeOther}</p> : null}
                  </div>
                ) : null}
                <div className={cropType === 'other' ? 'md:col-span-2' : ''}>
                  <label htmlFor="variety" className={labelClass}>
                    Variety
                  </label>
                  <input
                    id="variety"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="Optional"
                    className={`${cropFormInputClass} mt-1.5`}
                  />
                </div>
              </div>
            </div>

            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:bg-gray-50/80 max-md:p-4 dark:max-md:border-gray-700/60 dark:max-md:bg-gray-900/40">
              <h3 className={sectionTitleClass}>Field / plot</h3>
              <div className="mt-4">
                <label htmlFor="fieldId" className={labelClass}>
                  Field / plot
                </label>
                <div className="mt-1.5">
                  <FieldSelect
                    farmId={farmId}
                    fields={fields}
                    value={fieldId}
                    onChange={setFieldId}
                    onFieldsChange={setFields}
                  />
                </div>
              </div>
            </div>

            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:bg-gray-50/80 max-md:p-4 dark:max-md:border-gray-700/60 dark:max-md:bg-gray-900/40">
              <h3 className={sectionTitleClass}>Area, dates &amp; status</h3>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <div>
                  <label htmlFor="area" className={labelClass}>
                    Area
                  </label>
                  <input
                    id="area"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      clearFieldError('area');
                    }}
                    aria-invalid={Boolean(fieldErrors.area)}
                    className={fieldClass(Boolean(fieldErrors.area))}
                  />
                  {fieldErrors.area ? (
                    <p className={errorClass}>{fieldErrors.area}</p>
                  ) : (
                    <p className={hintClass}>Must be 0 or more.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="areaUnit" className={labelClass}>
                    Area unit
                  </label>
                  <select
                    id="areaUnit"
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value)}
                    className={`${cropFormInputClass} mt-1.5`}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="plantedDate" className={labelClass}>
                    Planting date
                  </label>
                  <input
                    id="plantedDate"
                    type="date"
                    value={plantedDate}
                    onChange={(e) => {
                      setPlantedDate(e.target.value);
                      clearFieldError('expectedHarvestDate');
                    }}
                    className={`${cropFormInputClass} mt-1.5`}
                  />
                  <p className={hintClass}>Optional</p>
                </div>
                <div>
                  <label htmlFor="expectedHarvestDate" className={labelClass}>
                    Expected harvest date
                  </label>
                  <input
                    id="expectedHarvestDate"
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => {
                      setExpectedHarvestDate(e.target.value);
                      clearFieldError('expectedHarvestDate');
                    }}
                    aria-invalid={Boolean(fieldErrors.expectedHarvestDate)}
                    className={fieldClass(Boolean(fieldErrors.expectedHarvestDate))}
                  />
                  {fieldErrors.expectedHarvestDate ? (
                    <p className={errorClass}>{fieldErrors.expectedHarvestDate}</p>
                  ) : (
                    <p className={hintClass}>Optional</p>
                  )}
                </div>
                <div>
                  <label htmlFor="status" className={labelClass}>
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`${cropFormInputClass} mt-1.5`}
                  >
                    {CROP_STATUSES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${cropFormInputClass} mt-1.5 max-md:min-h-[6.5rem]`}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="hidden md:flex flex-row justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <Link
              href={farmPath(`/dashboard/crops/${cropId}`)}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>

          <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[25] flex gap-3 border-t border-gray-200/90 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
            <Link
              href={farmPath(`/dashboard/crops/${cropId}`)}
              className="inline-flex min-h-12 min-w-[5.5rem] shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              Cancel
            </Link>
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
