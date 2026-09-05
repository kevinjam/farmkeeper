/** Harvest and crop-sale helpers. Remaining stock is harvested minus sold. */

export const HARVEST_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'bags', label: 'bags' },
  { value: 'crates', label: 'crates' },
  { value: 'bunches', label: 'bunches' },
  { value: 'pieces', label: 'pieces' },
  { value: 'litres', label: 'litres' },
  { value: 'other', label: 'other' },
] as const;

const LAST_UNIT_KEY = 'farmkeeper.lastHarvestUnit';

export type HarvestRecord = {
  _id: string;
  cropId?: { _id: string; name: string; cropType?: string } | string | null;
  fieldId?: { _id: string; name: string } | string | null;
  fieldName?: string;
  fieldLabel?: string;
  harvestDate: string;
  quantity: number;
  unit: string;
  notes?: string;
  soldQuantity?: number;
  remainingQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CropSaleRecord = {
  _id: string;
  cropId?: { _id: string; name: string; cropType?: string } | string | null;
  harvestId?:
    | { _id: string; harvestDate: string; quantity: number; unit: string; fieldName?: string }
    | string
    | null;
  saleDate: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  currency: string;
  buyerName?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HarvestUnitSummary = {
  unit: string;
  harvested: number;
  sold: number;
  remaining: number;
};

export type HarvestSummary = {
  currency: string;
  harvestCount: number;
  saleCount: number;
  totalRevenue: number;
  byUnit: HarvestUnitSummary[];
  recent: HarvestRecord[];
};

export function harvestCropId(record: { cropId?: HarvestRecord['cropId'] }) {
  const crop = record.cropId;
  if (!crop) return '';
  if (typeof crop === 'string') return crop;
  return crop._id || '';
}

export function harvestCropName(record: { cropId?: HarvestRecord['cropId'] }) {
  const crop = record.cropId;
  if (!crop || typeof crop === 'string') return '';
  return crop.name || '';
}

export function harvestFieldLabel(record: HarvestRecord) {
  if (record.fieldLabel) return record.fieldLabel;
  if (record.fieldName) return record.fieldName;
  const field = record.fieldId;
  if (field && typeof field === 'object') return field.name || '';
  return '';
}

export function harvestIdOf(record: CropSaleRecord) {
  const harvest = record.harvestId;
  if (!harvest) return '';
  if (typeof harvest === 'string') return harvest;
  return harvest._id || '';
}

export function formatProduceAmount(quantity: number, unit: string) {
  const qty = Number(quantity);
  const finite = Number.isFinite(qty) ? qty : 0;
  const safe = finite === 0 ? 0 : finite;
  const formatted = Number.isInteger(safe)
    ? safe.toLocaleString('en-US')
    : safe.toLocaleString('en-US', { maximumFractionDigits: 4 });
  return `${formatted} ${unit || 'units'}`.trim();
}

export function formatUnitBreakdown(
  rows: { unit: string; harvested?: number; sold?: number; remaining?: number; quantity?: number }[],
  key: 'harvested' | 'sold' | 'remaining' | 'quantity' = 'quantity'
) {
  const parts = rows
    .map((row) => {
      const amount = Number(row[key] ?? row.quantity ?? 0);
      if (!amount) return '';
      return formatProduceAmount(amount, row.unit);
    })
    .filter(Boolean);
  return parts.length ? parts.join(' · ') : '0';
}

export function formatHarvestDate(dateString?: string | null) {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function toDateInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function saleTotal(quantity: string | number, pricePerUnit: string | number) {
  const qty = Number(String(quantity).replace(/,/g, ''));
  const price = Number(String(pricePerUnit).replace(/,/g, ''));
  if (!Number.isFinite(qty) || !Number.isFinite(price)) return 0;
  return Math.round(qty * price * 100) / 100;
}

export function rememberHarvestUnit(unit: string) {
  if (typeof window === 'undefined' || !unit) return;
  window.localStorage.setItem(LAST_UNIT_KEY, unit);
}

export function lastHarvestUnit(fallback = 'kg') {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(LAST_UNIT_KEY) || fallback;
}

export function validateHarvestForm(input: {
  cropId: string;
  harvestDate: string;
  quantity: string;
  unit: string;
}) {
  const errors: Record<string, string> = {};
  if (!input.cropId) errors.cropId = 'Select a crop.';
  if (!input.harvestDate) errors.harvestDate = 'Choose a harvest date.';
  else if (Number.isNaN(new Date(input.harvestDate).getTime())) errors.harvestDate = 'Enter a valid date.';

  const qty = Number(String(input.quantity).replace(/,/g, ''));
  if (!String(input.quantity).trim()) errors.quantity = 'Enter how much you harvested.';
  else if (!Number.isFinite(qty) || qty <= 0) errors.quantity = 'Quantity must be greater than zero.';

  if (!input.unit) errors.unit = 'Select a unit.';
  return errors;
}

export function validateSaleForm(input: {
  cropId: string;
  saleDate: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
  harvestId?: string;
  available?: number | null;
  harvestUnit?: string;
}) {
  const errors: Record<string, string> = {};
  if (!input.cropId) errors.cropId = 'Select a crop.';
  if (!input.saleDate) errors.saleDate = 'Choose a sale date.';
  else if (Number.isNaN(new Date(input.saleDate).getTime())) errors.saleDate = 'Enter a valid date.';

  const qty = Number(String(input.quantity).replace(/,/g, ''));
  if (!String(input.quantity).trim()) errors.quantity = 'Enter how much you sold.';
  else if (!Number.isFinite(qty) || qty <= 0) errors.quantity = 'Quantity must be greater than zero.';

  if (!input.unit) errors.unit = 'Select a unit.';

  const price = Number(String(input.pricePerUnit).replace(/,/g, ''));
  if (!String(input.pricePerUnit).trim()) errors.pricePerUnit = 'Enter the price per unit.';
  else if (!Number.isFinite(price) || price < 0) errors.pricePerUnit = 'Price cannot be negative.';

  if (input.harvestId && input.harvestUnit && input.unit && input.unit !== input.harvestUnit) {
    errors.unit = `This harvest is recorded in ${input.harvestUnit}. Use the same unit.`;
  }

  if (input.harvestId && input.available != null && Number.isFinite(qty) && qty > input.available) {
    errors.quantity = `You only have ${formatProduceAmount(input.available, input.harvestUnit || input.unit)} available from this harvest.`;
  }

  return errors;
}

export const harvestFormInputClass =
  'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-gray-600 dark:bg-gray-700 dark:text-white max-md:min-h-12 max-md:text-base [font-size:16px]';
