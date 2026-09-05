'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sprout } from 'lucide-react';
import FieldSelect from '@/components/crops/FieldSelect';
import { CROP_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  CROP_FORM_STATUSES,
  CROP_TYPES,
  cropFormInputClass,
  resolveCropTypeForSubmit,
  validateCropForm,
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

export default function AddCropPage({ params }: { params: { farmId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<FarmField[]>([]);
  const [fieldId, setFieldId] = useState('');
  const [cropType, setCropType] = useState('');
  const [cropTypeOther, setCropTypeOther] = useState('');

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    if (!farmId) return;
    const loadFields = async () => {
      const response = await apiClient.getFields(farmId);
      if (response.success) {
        setFields((response.data || []) as FarmField[]);
      }
    };
    void loadFields();
  }, [farmId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '');
    const variety = String(formData.get('variety') || '').trim();
    const area = String(formData.get('area') || '');
    const areaUnit = String(formData.get('areaUnit') || 'acres');
    const status = String(formData.get('status') || 'planned');
    const plantedDate = String(formData.get('plantedDate') || '');
    const expectedHarvestDate = String(formData.get('expectedHarvestDate') || '');
    const fieldName = String(formData.get('fieldName') || '').trim();
    const notes = String(formData.get('notes') || '').trim();

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
      setFormError('Please fix the highlighted fields and try again.');
      const firstKey = Object.keys(errors)[0];
      requestAnimationFrame(() => {
        document.getElementById(firstKey)?.focus();
        document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        cropType: resolveCropTypeForSubmit(cropType, cropTypeOther),
        cropTypeOther: cropType === 'other' ? cropTypeOther.trim() : undefined,
        variety: variety || undefined,
        area: parseFloat(area),
        areaUnit,
        status,
        plantedDate: plantedDate || undefined,
        expectedHarvestDate: expectedHarvestDate || undefined,
        fieldId: fieldId || undefined,
        fieldName: fieldId ? undefined : fieldName || undefined,
        notes: notes || undefined,
      };

      const response = await apiClient.createCrop(farmId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to add crop');
      }

      const created = response.data as { _id?: string } | undefined;
      setFlashNotice(CROP_NOTICE.added);
      router.push(farmPath(created?._id ? `/dashboard/crops/${created._id}` : '/dashboard/crops'));
    } catch (error) {
      console.error('Error adding crop:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to add crop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl max-md:max-w-full max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 dark:border-gray-700 max-md:border-gray-200/80 max-md:bg-gradient-to-br max-md:from-emerald-500/10 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-emerald-500/10 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:items-start max-md:gap-3 md:block">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 md:hidden">
              <Sprout className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white max-md:text-lg max-md:leading-tight">
                Add Crop
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-md:mt-0.5 max-md:text-[13px] max-md:leading-snug">
                Record a crop growing on your farm.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="space-y-6 p-6 max-md:space-y-5 max-md:p-4">
            {formError ? (
              <NoticeBanner tone="error" onDismiss={() => setFormError('')}>
                {formError}
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
                    type="text"
                    name="name"
                    id="name"
                    maxLength={80}
                    placeholder="e.g. Coffee Garden A"
                    aria-invalid={Boolean(fieldErrors.name)}
                    onInput={() => clearFieldError('name')}
                    className={fieldClass(Boolean(fieldErrors.name))}
                  />
                  {fieldErrors.name ? <p className={errorClass}>{fieldErrors.name}</p> : (
                    <p className={hintClass}>A name you will recognize on this farm.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="cropType" className={labelClass}>
                    Crop type
                  </label>
                  <select
                    id="cropType"
                    name="cropType"
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
                  </select>
                  {fieldErrors.cropType ? (
                    <p className={errorClass}>{fieldErrors.cropType}</p>
                  ) : (
                    <p className={hintClass}>Choose Other if your crop is not listed.</p>
                  )}
                </div>
                {cropType === 'other' ? (
                  <div>
                    <label htmlFor="cropTypeOther" className={labelClass}>
                      Specify crop type
                    </label>
                    <input
                      type="text"
                      id="cropTypeOther"
                      name="cropTypeOther"
                      value={cropTypeOther}
                      maxLength={40}
                      onChange={(e) => {
                        setCropTypeOther(e.target.value);
                        clearFieldError('cropTypeOther');
                      }}
                      placeholder="e.g. Sorghum, Groundnuts"
                      aria-invalid={Boolean(fieldErrors.cropTypeOther)}
                      className={fieldClass(Boolean(fieldErrors.cropTypeOther))}
                    />
                    {fieldErrors.cropTypeOther ? (
                      <p className={errorClass}>{fieldErrors.cropTypeOther}</p>
                    ) : (
                      <p className={hintClass}>Farmers are not limited to the list above.</p>
                    )}
                  </div>
                ) : null}
                <div className={cropType === 'other' ? 'md:col-span-2' : ''}>
                  <label htmlFor="variety" className={labelClass}>
                    Variety
                  </label>
                  <input
                    type="text"
                    name="variety"
                    id="variety"
                    placeholder="Optional"
                    className={`${cropFormInputClass} mt-1.5`}
                  />
                  <p className={hintClass}>Optional. For example SL14 or a local variety.</p>
                </div>
              </div>
            </div>

            <div className="max-md:rounded-2xl max-md:border max-md:border-gray-200/80 max-md:bg-gray-50/80 max-md:p-4 dark:max-md:border-gray-700/60 dark:max-md:bg-gray-900/40">
              <h3 className={sectionTitleClass}>Field / plot</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Optional. Choose an existing plot or type a name such as North Field.
              </p>
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
                {!fieldId ? (
                  <div className="mt-3">
                    <label htmlFor="fieldName" className={labelClass}>
                      Or type a plot name
                    </label>
                    <input
                      type="text"
                      name="fieldName"
                      id="fieldName"
                      placeholder="e.g. North Field"
                      className={`${cropFormInputClass} mt-1.5`}
                    />
                  </div>
                ) : null}
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
                    type="number"
                    name="area"
                    id="area"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="2"
                    aria-invalid={Boolean(fieldErrors.area)}
                    onInput={() => clearFieldError('area')}
                    className={fieldClass(Boolean(fieldErrors.area))}
                  />
                  {fieldErrors.area ? (
                    <p className={errorClass}>{fieldErrors.area}</p>
                  ) : (
                    <p className={hintClass}>Must be 0 or more. Example: 2</p>
                  )}
                </div>
                <div>
                  <label htmlFor="areaUnit" className={labelClass}>
                    Area unit
                  </label>
                  <select id="areaUnit" name="areaUnit" defaultValue="acres" className={`${cropFormInputClass} mt-1.5`}>
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="plantedDate" className={labelClass}>
                    Planting date
                  </label>
                  <input
                    type="date"
                    name="plantedDate"
                    id="plantedDate"
                    onInput={() => clearFieldError('expectedHarvestDate')}
                    className={`${cropFormInputClass} mt-1.5`}
                  />
                  <p className={hintClass}>Optional</p>
                </div>
                <div>
                  <label htmlFor="expectedHarvestDate" className={labelClass}>
                    Expected harvest date
                  </label>
                  <input
                    type="date"
                    name="expectedHarvestDate"
                    id="expectedHarvestDate"
                    aria-invalid={Boolean(fieldErrors.expectedHarvestDate)}
                    onInput={() => clearFieldError('expectedHarvestDate')}
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
                  <select id="status" name="status" defaultValue="planned" className={`${cropFormInputClass} mt-1.5`}>
                    {CROP_FORM_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
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
                name="notes"
                rows={3}
                className={`${cropFormInputClass} mt-1.5 max-md:min-h-[6.5rem]`}
                placeholder="Optional"
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
              {isSubmitting ? 'Saving...' : 'Add Crop'}
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
                  <Sprout className="h-5 w-5" />
                  Add Crop
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
