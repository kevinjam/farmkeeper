export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

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

export const TASK_PRESETS = [
  { title: 'Collect eggs', description: 'Morning egg collection from the coop' },
  { title: 'Feed livestock', description: 'Morning and evening feeding round' },
  { title: 'Check water supply', description: 'Refill troughs and clean drinkers' },
  { title: 'Clean coop / pen', description: 'Remove waste and refresh bedding' },
  { title: 'Buy feed', description: 'Restock feed before supplies run low' },
  { title: 'Vaccinate / deworm', description: 'Scheduled animal health treatment' },
] as const;

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function sortTasksForDisplay(tasks: FarmTask[]): FarmTask[] {
  return [...tasks].sort((a, b) => {
    const dueDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (dueDiff !== 0) return dueDiff;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}

export function getDueLabel(dueDate: string): { label: string; tone: 'overdue' | 'today' | 'soon' | 'later' } {
  const due = new Date(dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      label: overdue === 1 ? 'Overdue 1 day' : `Overdue ${overdue} days`,
      tone: 'overdue',
    };
  }
  if (diffDays === 0) return { label: 'Today', tone: 'today' };
  if (diffDays === 1) return { label: 'Tomorrow', tone: 'soon' };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, tone: 'soon' };
  return {
    label: due.toLocaleDateString('en-UG', { month: 'short', day: 'numeric' }),
    tone: 'later',
  };
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

export function getTaskIconKey(title: string): 'eggs' | 'feed' | 'health' | 'water' | 'clean' | 'sales' | 'general' {
  const t = title.toLowerCase();
  if (t.includes('egg')) return 'eggs';
  if (t.includes('feed') || t.includes('buy')) return 'feed';
  if (t.includes('vaccin') || t.includes('deworm') || t.includes('vet')) return 'health';
  if (t.includes('water')) return 'water';
  if (t.includes('clean') || t.includes('coop') || t.includes('pen')) return 'clean';
  if (t.includes('sale') || t.includes('sell') || t.includes('market')) return 'sales';
  return 'general';
}
