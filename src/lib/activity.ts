export type ActivityType =
  | 'livestock_added'
  | 'livestock_updated'
  | 'livestock_deleted'
  | 'egg_collection'
  | 'egg_sale'
  | 'crop_added'
  | 'crop_updated'
  | 'crop_harvested'
  | 'task_created'
  | 'task_completed'
  | 'expense_added'
  | 'income_recorded'
  | 'other';

export type ActivityFilter = 'all' | 'livestock' | 'eggs' | 'crops' | 'finances' | 'tasks';

export interface FarmActivity {
  _id: string;
  activityType: ActivityType;
  description: string;
  createdAt: string;
  user?: { name?: string; email?: string };
  metadata?: {
    quantity?: number;
    amount?: number;
    currency?: string;
    type?: string;
  };
}

export const ACTIVITY_FILTER_TYPES: Record<Exclude<ActivityFilter, 'all'>, ActivityType[]> = {
  livestock: ['livestock_added', 'livestock_updated', 'livestock_deleted'],
  eggs: ['egg_collection', 'egg_sale'],
  crops: ['crop_added', 'crop_updated', 'crop_harvested'],
  finances: ['expense_added', 'income_recorded'],
  tasks: ['task_created', 'task_completed'],
};

export function filterActivities(activities: FarmActivity[], filter: ActivityFilter): FarmActivity[] {
  if (filter === 'all') return activities;
  const types = ACTIVITY_FILTER_TYPES[filter];
  return activities.filter((a) => types.includes(a.activityType));
}

export function getActivityCategory(type: ActivityType): Exclude<ActivityFilter, 'all'> | 'other' {
  if (ACTIVITY_FILTER_TYPES.livestock.includes(type)) return 'livestock';
  if (ACTIVITY_FILTER_TYPES.eggs.includes(type)) return 'eggs';
  if (ACTIVITY_FILTER_TYPES.crops.includes(type)) return 'crops';
  if (ACTIVITY_FILTER_TYPES.finances.includes(type)) return 'finances';
  if (ACTIVITY_FILTER_TYPES.tasks.includes(type)) return 'tasks';
  return 'other';
}

export function getActivityLabel(type: ActivityType): string {
  switch (type) {
    case 'livestock_added':
      return 'Livestock added';
    case 'livestock_updated':
      return 'Livestock updated';
    case 'livestock_deleted':
      return 'Livestock removed';
    case 'egg_collection':
      return 'Egg collection';
    case 'egg_sale':
      return 'Egg sale';
    case 'crop_added':
      return 'Crop added';
    case 'crop_updated':
      return 'Crop updated';
    case 'crop_harvested':
      return 'Harvest';
    case 'task_created':
      return 'Task created';
    case 'task_completed':
      return 'Task done';
    case 'expense_added':
      return 'Expense';
    case 'income_recorded':
      return 'Income';
    default:
      return 'Activity';
  }
}

export const ACTIVITY_STYLES: Record<
  string,
  { iconWrap: string; badge: string }
> = {
  livestock: {
    iconWrap: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  eggs: {
    iconWrap: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
  },
  crops: {
    iconWrap: 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300',
    badge: 'bg-lime-100 text-lime-900 dark:bg-lime-950/50 dark:text-lime-200',
  },
  finances: {
    iconWrap: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
  },
  tasks: {
    iconWrap: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
  },
  other: {
    iconWrap: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
};

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return days === 1 ? 'Yesterday' : `${days}d ago`;
  }
  return date.toLocaleDateString('en-UG', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function getActivityDateGroup(dateString: string): 'today' | 'yesterday' | 'this_week' | 'older' {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return 'this_week';
  return 'older';
}

export const DATE_GROUP_LABELS: Record<ReturnType<typeof getActivityDateGroup>, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This week',
  older: 'Earlier',
};

export function groupActivitiesByDate(activities: FarmActivity[]) {
  const groups: Record<ReturnType<typeof getActivityDateGroup>, FarmActivity[]> = {
    today: [],
    yesterday: [],
    this_week: [],
    older: [],
  };

  for (const activity of activities) {
    groups[getActivityDateGroup(activity.createdAt)].push(activity);
  }

  return (['today', 'yesterday', 'this_week', 'older'] as const)
    .filter((key) => groups[key].length > 0)
    .map((key) => ({ key, label: DATE_GROUP_LABELS[key], items: groups[key] }));
}
