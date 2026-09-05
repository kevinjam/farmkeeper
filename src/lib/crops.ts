export const CROP_TYPES = [
  { value: 'coffee', label: 'Coffee' },
  { value: 'maize', label: 'Maize' },
  { value: 'beans', label: 'Beans' },
  { value: 'rice', label: 'Rice' },
  { value: 'cassava', label: 'Cassava' },
  { value: 'banana', label: 'Banana' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'other', label: 'Other' },
] as const;

export const CROP_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'growing', label: 'Growing' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'harvested', label: 'Harvested' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const;

export const CROP_FORM_STATUSES = CROP_STATUSES.filter((status) => status.value !== 'failed');

export type CropFieldRef =
  | {
      _id: string;
      name: string;
      area?: number;
      areaUnit?: string;
    }
  | string
  | null
  | undefined;

export type CropRecord = {
  _id: string;
  name: string;
  cropType: string;
  variety?: string;
  area: number;
  areaUnit: string;
  status: string;
  plantedDate?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  yield?: number;
  yieldUnit?: string;
  location?: string;
  fieldId?: CropFieldRef;
  notes?: string;
  archived?: boolean;
  archivedAt?: string;
  daysSincePlanted?: number | null;
  daysUntilHarvest?: number | null;
  activityCount?: number;
  lastActivityDate?: string | null;
  insightSignal?: {
    tone: 'ok' | 'attention';
    label: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type FarmField = {
  _id: string;
  name: string;
  area?: number;
  areaUnit?: string;
  notes?: string;
  cropCount?: number;
};

export function formatCropTypeLabel(cropType: string) {
  const match = CROP_TYPES.find((item) => item.value === cropType);
  if (match && match.value !== 'other') return match.label;
  return cropType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatCropStatusLabel(status: string) {
  const match = CROP_STATUSES.find((item) => item.value === status);
  if (match) return match.label;
  if (status === 'planted') return 'Growing';
  return status.replace(/_/g, ' ');
}

export type CropFormValues = {
  name: string;
  cropType: string;
  cropTypeOther?: string;
  area: string;
  plantedDate?: string;
  expectedHarvestDate?: string;
};

export function resolveCropTypeForSubmit(cropType: string, cropTypeOther?: string) {
  if (cropType !== 'other') return cropType;
  return String(cropTypeOther || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export function validateCropForm(values: CropFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = values.name.trim();
  if (!name) {
    errors.name = 'Enter a crop name, for example Coffee Garden A.';
  } else if (name.length > 80) {
    errors.name = 'Crop name must be 80 characters or fewer.';
  }

  if (!values.cropType) {
    errors.cropType = 'Select a crop type.';
  } else if (values.cropType === 'other') {
    const other = String(values.cropTypeOther || '').trim();
    if (!other) {
      errors.cropTypeOther = 'Enter the crop type, for example Sorghum or Groundnuts.';
    } else if (other.length > 40) {
      errors.cropTypeOther = 'Crop type must be 40 characters or fewer.';
    } else if (!resolveCropTypeForSubmit('other', other)) {
      errors.cropTypeOther = 'Enter a crop type using letters or numbers.';
    }
  }

  const areaRaw = String(values.area ?? '').trim();
  const area = Number(areaRaw);
  if (!areaRaw) {
    errors.area = 'Enter the area planted. Example: 2';
  } else if (!Number.isFinite(area)) {
    errors.area = 'Enter a valid area. Example: 2';
  } else if (area < 0) {
    errors.area = 'Area cannot be negative.';
  }

  const planted = values.plantedDate || '';
  const harvest = values.expectedHarvestDate || '';
  if (planted && harvest && harvest < planted) {
    errors.expectedHarvestDate = 'Expected harvest should be on or after the planting date.';
  }

  return errors;
}

export function toDateInput(value?: string | null) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function cropFieldId(fieldId: CropFieldRef): string {
  if (!fieldId) return '';
  if (typeof fieldId === 'string') return fieldId;
  return fieldId._id || '';
}

export function cropFieldName(crop: { fieldId?: CropFieldRef; location?: string }): string {
  if (crop.fieldId && typeof crop.fieldId === 'object' && crop.fieldId.name) {
    return crop.fieldId.name;
  }
  return crop.location || '';
}

export function cropStatusBadgeClass(status: string) {
  switch (status) {
    case 'growing':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200';
    case 'harvesting':
      return 'bg-lime-100 text-lime-900 dark:bg-lime-900/60 dark:text-lime-100';
    case 'harvested':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100';
    case 'completed':
      return 'bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100';
    case 'planted':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200';
    case 'planned':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

export function formatCropDate(dateString?: string | null) {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCropArea(area: number, areaUnit?: string) {
  const value = Number(area);
  const amount = Number.isFinite(value)
    ? Number.isInteger(value)
      ? String(value)
      : String(Number(value.toFixed(2)))
    : '0';
  const hectares = areaUnit === 'hectares';
  if (value === 1) return `${amount} ${hectares ? 'Hectare' : 'Acre'}`;
  return `${amount} ${hectares ? 'Hectares' : 'Acres'}`;
}

export function cropPlantingDate(crop: { plantedDate?: string; plantingDate?: string }) {
  return crop.plantedDate || crop.plantingDate;
}

export function formatCropAreaTotal(crops: Array<{ area: number; areaUnit?: string }>) {
  let acres = 0;
  let hectares = 0;
  for (const crop of crops) {
    if (crop.areaUnit === 'hectares') hectares += Number(crop.area) || 0;
    else acres += Number(crop.area) || 0;
  }
  const parts: string[] = [];
  if (acres > 0 || hectares === 0) parts.push(`${acres.toFixed(1)} acres`);
  if (hectares > 0) parts.push(`${hectares.toFixed(1)} ha`);
  return parts.join(' · ');
}

export const cropFormInputClass =
  'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-gray-600 dark:bg-gray-700 dark:text-white max-md:min-h-12 max-md:text-base [font-size:16px]';
