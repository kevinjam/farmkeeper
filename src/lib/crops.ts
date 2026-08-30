export const CROP_TYPES = [
  { value: 'cereals', label: 'Cereals' },
  { value: 'legumes', label: 'Legumes' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'herbs', label: 'Herbs' },
  { value: 'root_crops', label: 'Root crops' },
  { value: 'cash_crops', label: 'Cash crops' },
  { value: 'fodder', label: 'Fodder' },
  { value: 'other', label: 'Other' },
] as const;

export const CROP_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'planted', label: 'Planted' },
  { value: 'growing', label: 'Growing' },
  { value: 'harvested', label: 'Harvested' },
  { value: 'failed', label: 'Failed' },
] as const;

export const YIELD_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'tons', label: 'Tons' },
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'bushels', label: 'Bushels' },
  { value: 'bags', label: 'Bags' },
  { value: 'units', label: 'Units' },
] as const;

export function formatCropTypeLabel(cropType: string) {
  return cropType.replace(/_/g, ' ');
}

export function toDateInput(value?: string | null) {
  if (!value) return '';
  return String(value).slice(0, 10);
}
