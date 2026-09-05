'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingBag } from 'lucide-react';
import { NoticeBanner } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { formatExpenseAmount } from '@/lib/expenses';
import {
  HARVEST_UNITS,
  formatHarvestDate,
  formatProduceAmount,
  harvestCropId,
  harvestFormInputClass,
  harvestIdOf,
  lastHarvestUnit,
  rememberHarvestUnit,
  saleTotal,
  toDateInput,
  validateSaleForm,
  type CropSaleRecord,
  type HarvestRecord,
} from '@/lib/harvest';
import type { CropRecord } from '@/lib/crops';

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold';
const errorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';

function fieldClass(hasError: boolean) {
  return `${harvestFormInputClass} mt-1.5 ${
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500' : ''
  }`;
}

export default function SaleForm({
  farmId,
  mode,
  sale,
  initialCropId = '',
  initialHarvestId = '',
  currency = 'UGX',
  onSuccess,
}: {
  farmId: string;
  mode: 'add' | 'edit';
  sale?: CropSaleRecord | null;
  initialCropId?: string;
  initialHarvestId?: string;
  currency?: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cropId, setCropId] = useState(initialCropId);
  const [harvestId, setHarvestId] = useState(initialHarvestId);
  const [unit, setUnit] = useState(sale?.unit || lastHarvestUnit());
  const [quantity, setQuantity] = useState(sale ? String(sale.quantity) : '');
  const [price, setPrice] = useState(sale ? String(sale.pricePerUnit) : '');
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [loadingHarvests, setLoadingHarvests] = useState(false);

  useEffect(() => {
    if (!farmId) return;
    const load = async () => {
      const response = await apiClient.getCrops(farmId);
      if (response.success) setCrops((response.data || []) as CropRecord[]);
    };
    void load();
  }, [farmId]);

  useEffect(() => {
    if (sale) {
      setCropId(harvestCropId(sale));
      setHarvestId(harvestIdOf(sale));
      setUnit(sale.unit || 'kg');
      setQuantity(String(sale.quantity));
      setPrice(String(sale.pricePerUnit));
    } else {
      if (initialCropId) setCropId(initialCropId);
      if (initialHarvestId) setHarvestId(initialHarvestId);
    }
  }, [sale, initialCropId, initialHarvestId]);

  useEffect(() => {
    if (!farmId || !cropId) {
      setHarvests([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingHarvests(true);
      const response = await apiClient.getHarvests(farmId, cropId);
      if (!cancelled && response.success) setHarvests((response.data || []) as HarvestRecord[]);
      else if (!cancelled) setHarvests([]);
      setLoadingHarvests(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [farmId, cropId]);

  const selectedHarvest = harvests.find((item) => item._id === harvestId) || null;
  const available = selectedHarvest
    ? Number(selectedHarvest.remainingQuantity ?? selectedHarvest.quantity) +
      (mode === 'edit' && sale && harvestIdOf(sale) === selectedHarvest._id ? Number(sale.quantity) || 0 : 0)
    : null;

  useEffect(() => {
    if (selectedHarvest) setUnit(selectedHarvest.unit);
  }, [selectedHarvest]);

  const total = useMemo(() => saleTotal(quantity, price), [quantity, price]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    const formData = new FormData(e.currentTarget);
    const saleDate = String(formData.get('saleDate') || '');
    const buyerName = String(formData.get('buyerName') || '').trim();
    const notes = String(formData.get('notes') || '').trim();
    const errors = validateSaleForm({
      cropId,
      saleDate,
      quantity,
      unit,
      pricePerUnit: price,
      harvestId,
      available,
      harvestUnit: selectedHarvest?.unit,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        cropId,
        harvestId: harvestId || null,
        saleDate,
        quantity: Number(quantity.replace(/,/g, '')),
        unit,
        pricePerUnit: Number(price.replace(/,/g, '')),
        buyerName: buyerName || undefined,
        notes: notes || undefined,
        currency,
      };
      const response =
        mode === 'edit' && sale
          ? await apiClient.updateCropSale(farmId, sale._id, payload)
          : await apiClient.createCropSale(farmId, payload);
      if (!response.success) throw new Error(response.error || 'Failed to save sale');
      rememberHarvestUnit(unit);
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save sale. Please try again.');
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
                setHarvestId('');
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
            <label htmlFor="harvestId" className={labelClass}>
              Harvest <span className="font-normal text-gray-400">(preferred)</span>
            </label>
            <select
              id="harvestId"
              value={harvestId}
              disabled={!cropId || loadingHarvests}
              onChange={(e) => setHarvestId(e.target.value)}
              className={`${fieldClass(false)} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <option value="">{cropId ? 'Not linked to a harvest' : 'Select a crop first'}</option>
              {harvests.map((item) => (
                <option key={item._id} value={item._id}>
                  {formatHarvestDate(item.harvestDate)} — {formatProduceAmount(item.quantity, item.unit)}
                  {item.remainingQuantity != null ? ` (${formatProduceAmount(item.remainingQuantity, item.unit)} left)` : ''}
                </option>
              ))}
            </select>
            {selectedHarvest && available != null ? (
              <p className="mt-1 text-xs text-gray-500">
                Available from this harvest: {formatProduceAmount(available, selectedHarvest.unit)}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="saleDate" className={labelClass}>
              Sale date
            </label>
            <input
              id="saleDate"
              name="saleDate"
              type="date"
              required
              defaultValue={toDateInput(sale?.saleDate) || new Date().toISOString().slice(0, 10)}
              className={fieldClass(Boolean(fieldErrors.saleDate))}
            />
            {fieldErrors.saleDate ? <p className={errorClass}>{fieldErrors.saleDate}</p> : null}
          </div>
          <div>
            <label htmlFor="quantity" className={labelClass}>
              Quantity sold
            </label>
            <input
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              inputMode="decimal"
              min="0.0001"
              step="any"
              required
              placeholder="100"
              className={fieldClass(Boolean(fieldErrors.quantity))}
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
              disabled={Boolean(selectedHarvest)}
              onChange={(e) => setUnit(e.target.value)}
              className={`${fieldClass(Boolean(fieldErrors.unit))} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {HARVEST_UNITS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {fieldErrors.unit ? <p className={errorClass}>{fieldErrors.unit}</p> : null}
          </div>
          <div>
            <label htmlFor="pricePerUnit" className={labelClass}>
              Price per unit ({currency})
            </label>
            <input
              id="pricePerUnit"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              required
              placeholder="4"
              className={fieldClass(Boolean(fieldErrors.pricePerUnit))}
            />
            {fieldErrors.pricePerUnit ? <p className={errorClass}>{fieldErrors.pricePerUnit}</p> : null}
          </div>
          <div className="md:col-span-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
              Total
            </p>
            <p className="text-xl font-bold tabular-nums text-emerald-950 dark:text-emerald-100">
              {formatExpenseAmount(total, currency)}
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">Quantity × price per unit</p>
          </div>
          <div>
            <label htmlFor="buyerName" className={labelClass}>
              Buyer <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="buyerName"
              name="buyerName"
              type="text"
              defaultValue={sale?.buyerName || ''}
              placeholder="ABC Coffee Buyers"
              className={`${harvestFormInputClass} mt-1.5`}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClass}>
              Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={sale?.notes || ''}
              className={`${harvestFormInputClass} mt-1.5 max-md:min-h-[5rem]`}
            />
          </div>
        </div>
      </div>
      <div className="hidden justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50 md:flex">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary inline-flex min-h-10 items-center gap-2 disabled:opacity-50">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
          {isSubmitting ? 'Saving…' : 'Save sale'}
        </button>
      </div>
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[25] flex gap-3 border-t border-gray-200/90 bg-white/95 px-3 py-3 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 md:hidden">
        <button type="button" onClick={() => router.back()} className="min-h-12 min-w-[5.5rem] rounded-xl border px-4 text-sm font-semibold">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-primary-600 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Save sale'}
        </button>
      </div>
    </form>
  );
}
