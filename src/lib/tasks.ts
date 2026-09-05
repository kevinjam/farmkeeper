export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskArea = 'crops' | 'animals' | 'farm';
export type TaskIconKey =
  | 'eggs'
  | 'feed'
  | 'health'
  | 'water'
  | 'clean'
  | 'sales'
  | 'crops'
  | 'harvest'
  | 'general';

export interface FarmTask {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: { name?: string };
  createdBy?: { name?: string };
}

export const TASK_PRESET_GROUPS: { id: TaskArea; label: string }[] = [
  { id: 'crops', label: 'Crops' },
  { id: 'animals', label: 'Animals' },
  { id: 'farm', label: 'Farm' },
];

export const TASK_PRESETS = [
  { area: 'crops' as const, title: 'Weed fields', description: 'Pull weeds before they take over the crop' },
  { area: 'crops' as const, title: 'Fertilize crops', description: 'Apply fertilizer where it is due' },
  { area: 'crops' as const, title: 'Irrigate crops', description: 'Water the garden or field' },
  { area: 'crops' as const, title: 'Harvest produce', description: 'Pick what is ready in the field' },
  { area: 'animals' as const, title: 'Collect eggs', description: 'Morning egg collection from the coop' },
  { area: 'animals' as const, title: 'Feed livestock', description: 'Morning and evening feeding round' },
  { area: 'animals' as const, title: 'Vaccinate / deworm', description: 'Scheduled animal health treatment' },
  { area: 'farm' as const, title: 'Check water supply', description: 'Refill troughs, drinkers, and irrigation' },
  { area: 'farm' as const, title: 'Buy feed', description: 'Restock feed before supplies run low' },
] as const;

export const TASK_AREA_LABELS: Record<TaskArea, string> = {
  crops: 'Crops',
  animals: 'Animals',
  farm: 'Farm',
};

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

const ANIMAL_KEYWORDS = [
  'egg',
  'livestock',
  'chicken',
  'hen',
  'cock',
  'cow',
  'cattle',
  'goat',
  'pig',
  'sheep',
  'duck',
  'turkey',
  'flock',
  'herd',
  'coop',
  'pen',
  'vaccin',
  'deworm',
  'vet',
  'animal',
  'broiler',
  'layer',
];

const CROP_KEYWORDS = [
  'crop',
  'weed',
  'fertiliz',
  'plant',
  'irrigat',
  'spray',
  'prun',
  'harvest',
  'mulch',
  'garden',
  'maize',
  'coffee',
  'field',
  'labour',
  'banana',
  'cassava',
  'tomato',
  'bean',
  'rice',
  'produce',
];

export function sortTasksForDisplay(tasks: FarmTask[]): FarmTask[] {
  return [...tasks].sort((a, b) => {
    const dueDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (dueDiff !== 0) return dueDiff;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}

export function getDueLabel(dueDate: string): {
  label: string;
  compact: string;
  tone: 'overdue' | 'today' | 'soon' | 'later';
} {
  const due = new Date(dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      label: overdue === 1 ? 'Overdue 1 day' : `Overdue ${overdue} days`,
      compact: overdue === 1 ? '1d late' : `${overdue}d late`,
      tone: 'overdue',
    };
  }
  if (diffDays === 0) return { label: 'Today', compact: 'Today', tone: 'today' };
  if (diffDays === 1) return { label: 'Tomorrow', compact: 'Tomorrow', tone: 'soon' };
  if (diffDays <= 7) {
    return { label: `In ${diffDays} days`, compact: `In ${diffDays}d`, tone: 'soon' };
  }
  const later = due.toLocaleDateString('en-UG', { month: 'short', day: 'numeric' });
  return { label: later, compact: later, tone: 'later' };
}

export function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'Urgent';
    case 'medium':
      return 'Normal';
    default:
      return 'Low';
  }
}

export function getTaskArea(title: string): TaskArea {
  const t = title.toLowerCase();
  if (ANIMAL_KEYWORDS.some((keyword) => t.includes(keyword))) return 'animals';
  if (CROP_KEYWORDS.some((keyword) => t.includes(keyword))) return 'crops';
  if (t.includes('buy')) return 'farm';
  if (t.includes('feed')) return 'animals';
  return 'farm';
}

export function getTaskIconKey(title: string): TaskIconKey {
  const t = title.toLowerCase();
  if (t.includes('sale') || t.includes('sell') || t.includes('market')) return 'sales';
  if (t.includes('harvest')) return 'harvest';
  if (t.includes('egg')) return 'eggs';
  if (t.includes('vaccin') || t.includes('deworm') || t.includes('vet')) return 'health';
  if (t.includes('water') || t.includes('irrigat')) return 'water';
  if (t.includes('clean') || t.includes('coop') || t.includes('pen')) return 'clean';
  if (t.includes('feed') || t.includes('buy')) return 'feed';
  if (CROP_KEYWORDS.some((keyword) => t.includes(keyword))) return 'crops';
  return 'general';
}
