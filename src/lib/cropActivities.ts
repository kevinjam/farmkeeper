/**
 * Crop activity history — work already done on a crop.
 * Farm tasks are a separate to-do list and are not synced here yet.
 */
export const CROP_ACTIVITY_TYPES = [
  { value: 'planting', label: 'Planting' },
  { value: 'weeding', label: 'Weeding' },
  { value: 'fertilizing', label: 'Fertilizing' },
  { value: 'spraying', label: 'Spraying' },
  { value: 'pruning', label: 'Pruning' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'labour', label: 'Labour' },
  { value: 'other', label: 'Other' },
] as const;

export type CropActivityRecord = {
  _id: string;
  farmId: string;
  cropId: string;
  activityType: string;
  otherType?: string;
  activityDate: string;
  date?: string;
  title?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export function cropActivityTypeLabel(activityType: string) {
  const match = CROP_ACTIVITY_TYPES.find((type) => type.value === activityType);
  if (match) return match.label;
  return activityType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatCropActivityType(activity: {
  activityType: string;
  otherType?: string;
  title?: string;
}) {
  if (activity.title) return activity.title;
  if (activity.activityType === 'other' && activity.otherType) {
    return activity.otherType;
  }
  const match = CROP_ACTIVITY_TYPES.find((type) => type.value === activity.activityType);
  if (match) return match.label;
  return activity.activityType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatCropActivityDate(dateString?: string | null) {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Calendar label for dashboard crop work: Today, Yesterday, or the recorded date. */
export function formatCropActivityDayLabel(dateString?: string | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return formatCropActivityDate(dateString);
}

export function cropActivitySummary(
  cropName: string,
  activity: { activityType: string; otherType?: string; title?: string }
) {
  const name = cropName.trim() || 'this crop';
  const title = formatCropActivityType(activity);
  switch (activity.activityType) {
    case 'weeding':
      return `${name} was weeded.`;
    case 'fertilizing':
      return `Applied fertilizer to ${name}.`;
    case 'spraying':
      return `Applied pest control treatment.`;
    case 'pruning':
      return `${name} was pruned.`;
    case 'irrigation':
      return `${name} was irrigated.`;
    case 'planting':
      return `${name} was planted.`;
    case 'labour':
      return `Labour was recorded on ${name}.`;
    case 'other':
      return `${title} was recorded on ${name}.`;
    default:
      return `${title} was recorded on ${name}.`;
  }
}

export function cropActivityBody(
  cropName: string,
  activity: {
    activityType: string;
    otherType?: string;
    title?: string;
    description?: string;
    notes?: string;
  }
) {
  const description = String(activity.description || '').trim();
  if (description) return description;
  const notes = String(activity.notes || '').trim();
  if (notes) return notes;
  return cropActivitySummary(cropName, activity);
}

export function cropActivityExtraNotes(activity: { description?: string; notes?: string }) {
  const description = String(activity.description || '').trim();
  const notes = String(activity.notes || '').trim();
  if (description && notes) return notes;
  return '';
}

export function todayDateInput() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function validateCropActivityForm(values: {
  activityType: string;
  otherType?: string;
  activityDate: string;
  description: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.activityType) {
    errors.activityType = 'Select an activity type.';
  } else if (values.activityType === 'other' && !String(values.otherType || '').trim()) {
    errors.otherType = 'Enter the activity type, for example Mulching.';
  }
  if (!values.activityDate) {
    errors.activityDate = 'Enter the date this work was done.';
  }
  if (!String(values.description || '').trim()) {
    errors.description = 'Enter a description, for example: Removed weeds around the coffee plants.';
  }
  return errors;
}
