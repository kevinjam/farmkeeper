'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Wheat } from 'lucide-react';
import { NoticeBanner } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import {
  HARVEST_UNITS,
  harvestCropId,
  harvestFieldLabel,
  harvestFormInputClass,
  lastHarvestUnit,
  rememberHarvestUnit,
  toDateInput,
  validateHarvestForm,
  type HarvestRecord,
} from '@/lib/harvest';
import type { CropRecord, FarmField } from '@/lib/crops';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';

function fieldClass(hasError: boolean) {
  return `${harvestFormInputClass} mt-1.5 ${
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500' : ''
  }`;
}

export default function HarvestForm({
  farmId,
  mode,
  harvest,
  initialCropId = '',
  onSuccess,
}: {
  farmId: string;
  mode: 'add' | 'edit';
  harvest?: HarvestRecord | null;
  initialCropId?: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cropId, setCropId] = useState(initialCropId);
  const [fieldId, setFieldId] = useState('');
  const [unit, setUnit] = useState(harvest?.unit || lastHarvestUnit());
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [fields, setFields] = useState<FarmField[]>([]);

  useEffect(() => {
    if (!farmId) return;
    const load = async () => {
      const [cropRes, fieldRes] = await Promise.all([apiClient.getCrops(farmId), apiClient.getFields(farmId)]);
      if (cropRes.success) setCrops((cropRes.data || []) as CropRecord[]);
      if (fieldRes.success) setFields((fieldRes.data || []) as FarmField[]);
    };
    void load();
  }, [farmId]);

  useEffect(() => {
    if (harvest) {
      setCropId(harvestCropId(harvest));
      const linkedField =
        typeof harvest.fieldId === 'object' && harvest.fieldId ? harvest.fieldId._id : String(harvest.fieldId || '');
      setFieldId(linkedField);
      setUnit(harvest.unit || 'kg');
    } else if (initialCropId) {
      setCropId(initialCropId);
    }
  }, [harvest, initialCropId]);

  useEffect(() => {
    if (harvest || fieldId || !cropId) return;
    const crop = crops.find((item) => item._id === cropId);
    const cropField = crop?.fieldId;
    if (cropField && typeof cropField === 'object') setFieldId(cropField._id);
    else if (typeof cropField === 'string') setFieldId(cropField);
  }, [cropId, crops, fieldId, harvest]);

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    const formData = new FormData(e.currentTarget);
    const quantity = String(formData.get('quantity') || '');
    const harvestDate = String(formData.get('harvestDate') || '');
    const notes = String(formData.get('notes') || '').trim();
    const errors = validateHarvestForm({ cropId, harvestDate, quantity, unit });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        cropId,
        fieldId: fieldId || null,
        harvestDate,
        quantity: Number(quantity.replace(/,/g, '')),
        unit,
        notes: notes || undefined,
      };
      const response =
        mode === 'edit' && harvest
          ? await apiClient.updateHarvest(farmId, harvest._id, payload)
          : await apiClient.createHarvest(farmId, payload);
      if (!response.success) throw new Error(response.error || 'Failed to save harvest');
      rememberHarvestUnit(unit);
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save harvest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError ? (
        <div className="px-4 pt-4 md:px-6">
          <NoticeBanner tone="error">{formError}</NoticeBanner>
        </div>
      ) : null}
      <div className="space-y-5 p-4 md:space-y-6 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="cropId" className={labelClass}>
              Crop
            </label>
            <select
              id="cropId"
              value={cropId}
              required
              onChange={(e) => {
                setCropId(e.target.value);
                setFieldId('');
                clearFieldError('cropId');
              }}
              className={fieldClass(Boolean(fieldErrors.cropId))}
            >
              <option value="">Select a crop</option>
              {crops.map((crop) => (
                <option key={crop._id} value={crop._id}>
                  {crop.name}
                </option>
              ))}
            </select>
            {fieldErrors.cropId ? <p className={errorClass}>{fieldErrors.cropId}</p> : null}
          </div>
          <div>
            <label htmlFor="fieldId" className={labelClass}>
              Field / plot <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <select
              id="fieldId"
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              className={fieldClass(false)}
            >
              <option value="">Not assigned</option>
              {fields.map((field) => (
                <option key={field._id} value={field._id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="harvestDate" className={labelClass}>
              Harvest date
            </label>
            <input
              id="harvestDate"
              name="harvestDate"
              type="date"
              required
              defaultValue={toDateInput(harvest?.harvestDate) || new Date().toISOString().slice(0, 10)}
              className={fieldClass(Boolean(fieldErrors.harvestDate))}
              onChange={() => clearFieldError('harvestDate')}
            />
            {fieldErrors.harvestDate ? <p className={errorClass}>{fieldErrors.harvestDate}</p> : null}
          </div>
          <div>
            <label htmlFor="quantity" className={labelClass}>
              Quantity harvested
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="decimal"
              min="0.0001"
              step="any"
              required
              defaultValue={harvest?.quantity ?? ''}
              placeholder="250"
              className={fieldClass(Boolean(fieldErrors.quantity))}
              onChange={() => clearFieldError('quantity')}
            />
            {fieldErrors.quantity ? <p className={errorClass}>{fieldErrors.quantity}</p> : null}
          </div>
          <div>
            <label htmlFor="unit" className={labelClass}>
              Unit
            </label>
            <select
              id="unit"
              value={unit}
              required
              onChange={(e) => {
                setUnit(e.target.value);
                clearFieldError('unit');
              }}
              className={fieldClass(Boolean(fieldErrors.unit))}
            >
              {HARVEST_UNITS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {fieldErrors.unit ? <p className={errorClass}>{fieldErrors.unit}</p> : null}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClass}>
              Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={harvest?.notes || ''}
              placeholder="First picking from the north section."
              className={`${harvestFormInputClass} mt-1.5 max-md:min-h-[5rem]`}
            />
          </div>
        </div>
        {mode === 'edit' && harvestFieldLabel(harvest!) ? (
          <p className="text-xs text-gray-500">Currently recorded against {harvestFieldLabel(harvest!)}.</p>
        ) : null}
      </div>
      <div className="hidden justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50 md:flex">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary inline-flex min-h-10 items-center gap-2 disabled:opacity-50">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wheat className="h-4 w-4" />}
          {isSubmitting ? 'Saving…' : 'Save harvest'}
        </button>
      </div>
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[25] flex gap-3 border-t border-gray-200/90 bg-white/95 px-3 py-3 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 md:hidden">
        <button type="button" onClick={() => router.back()} className="min-h-12 min-w-[5.5rem] rounded-xl border border-gray-300 px-4 text-sm font-semibold">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {isSubmitting ? 'Saving…' : 'Save harvest'}
        </button>
      </div>
    </form>
  );
}
