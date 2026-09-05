export const STOCK_TYPES = [
  { value: 'layer_feed', label: 'Layer Feed' },
  { value: 'broiler_feed', label: 'Broiler Feed' },
  { value: 'starter_feed', label: 'Starter Feed' },
  { value: 'grower_feed', label: 'Grower Feed' },
  { value: 'finisher_feed', label: 'Finisher Feed' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'other', label: 'Other' },
] as const;

export const FEED_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'lbs', label: 'lbs' },
  { value: 'bags', label: 'bags' },
  { value: 'tonnes', label: 'tonnes' },
] as const;

export type FeedStockType = (typeof STOCK_TYPES)[number]['value'];
export type FeedUnit = (typeof FEED_UNITS)[number]['value'];

export type FeedStock = {
  _id: string;
  stockType: string;
  name: string;
  quantity: number;
  unit: string;
  minimumThreshold: number;
  supplier?: string;
  purchaseDate: string;
  expiryDate?: string;
  costPerUnit?: number;
  totalCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type FeedFormData = {
  stockType: FeedStockType;
  name: string;
  quantity: number;
  unit: FeedUnit;
  minimumThreshold: number;
  supplier: string;
  purchaseDate: string;
  expiryDate: string;
  costPerUnit: string;
  totalCost: string;
  notes: string;
};

export const emptyFeedForm = (): FeedFormData => ({
  stockType: 'layer_feed',
  name: '',
  quantity: 0,
  unit: 'kg',
  minimumThreshold: 5,
  supplier: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  costPerUnit: '',
  totalCost: '',
  notes: '',
});

export function formatStockType(stockType: string) {
  return STOCK_TYPES.find((type) => type.value === stockType)?.label || stockType;
}

export function normalizeFeedUnit(unit?: string): FeedUnit {
  if (unit === 'tons' || unit === 'tonnes') return 'tonnes';
  if (unit === 'lbs' || unit === 'kg' || unit === 'bags') return unit;
  return 'kg';
}

export function feedStockToForm(item: FeedStock): FeedFormData {
  return {
    stockType: (STOCK_TYPES.some((type) => type.value === item.stockType)
      ? item.stockType
      : 'other') as FeedStockType,
    name: item.name,
    quantity: item.quantity,
    unit: normalizeFeedUnit(item.unit),
    minimumThreshold: item.minimumThreshold,
    supplier: item.supplier || '',
    purchaseDate: item.purchaseDate.split('T')[0],
    expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
    costPerUnit: item.costPerUnit != null ? String(item.costPerUnit) : '',
    totalCost: item.totalCost != null ? String(item.totalCost) : '',
    notes: item.notes || '',
  };
}

export function toFeedstockPayload(form: FeedFormData) {
  const costPerUnit = form.costPerUnit.trim() ? Number(form.costPerUnit) : undefined;
  const totalCost = form.totalCost.trim() ? Number(form.totalCost) : undefined;

  return {
    stockType: form.stockType,
    name: form.name.trim(),
    quantity: form.quantity,
    unit: form.unit,
    minimumThreshold: form.minimumThreshold,
    supplier: form.supplier.trim() || undefined,
    purchaseDate: form.purchaseDate,
    expiryDate: form.expiryDate || undefined,
    costPerUnit: Number.isFinite(costPerUnit) ? costPerUnit : undefined,
    totalCost: Number.isFinite(totalCost) ? totalCost : undefined,
    notes: form.notes.trim() || undefined,
  };
}
