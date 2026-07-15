'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ClipboardList,
  Droplets,
  Egg,
  Loader2,
  Plus,
  ShoppingBag,
  Sparkles,
  Sprout,
  Stethoscope,
  Wheat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import {
  FarmTask,
  getDueLabel,
  getPriorityLabel,
  getTaskIconKey,
  sortTasksForDisplay,
} from '@/lib/tasks';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import AddTaskModal from '@/components/dashboard/AddTaskModal';

const ICONS = {
  eggs: Egg,
  feed: Wheat,
  health: Stethoscope,
  water: Droplets,
  clean: Sparkles,
  sales: ShoppingBag,
  general: ClipboardList,
} as const;

const ICON_STYLES = {
  eggs: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  feed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  health: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  water: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  clean: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  sales: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  general: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
};

const DUE_STYLES = {
  overdue: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  today: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
  soon: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
  later: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function TaskRow({
  task,
  onComplete,
  completingId,
}: {
  task: FarmTask;
  onComplete: (id: string) => void;
  completingId: string | null;
}) {
  const iconKey = getTaskIconKey(task.title);
  const Icon = ICONS[iconKey];
  const due = getDueLabel(task.dueDate);
  const isCompleting = completingId === task._id;

  return (
    <div
      className={`group relative flex gap-3 border-b border-gray-100 px-4 py-3.5 last:border-0 dark:border-gray-700/80 max-md:active:bg-gray-50/80 dark:max-md:active:bg-gray-800/40 md:px-4 md:py-4 ${
        due.tone === 'overdue' ? 'bg-red-50/40 dark:bg-red-950/10' : ''
      }`}
    >
      {due.tone === 'overdue' && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-red-500/80" />
      )}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[iconKey]}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 dark:text-white leading-snug">{task.title}</h4>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${DUE_STYLES[due.tone]}`}>
            {due.label}
          </span>
        </div>
        {task.description && task.description !== task.title && (
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`text-[11px] font-medium ${
              task.priority === 'high'
                ? 'text-red-600 dark:text-red-400'
                : task.priority === 'medium'
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {getPriorityLabel(task.priority)}
          </span>
          {task.status === 'in_progress' && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              In progress
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onComplete(task._id)}
        disabled={isCompleting}
        className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl border border-gray-200 bg-white text-primary-600 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-primary-400 dark:hover:bg-primary-950/30"
        aria-label={`Mark ${task.title} as done`}
        title="Mark done"
      >
        {isCompleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-5 w-5" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}

interface UpcomingTasksCardProps {
  farmId: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function UpcomingTasksCard({
  farmId,
  limit = 3,
  showViewAll = true,
  className = '',
}: UpcomingTasksCardProps) {
  const { farmPath } = useFarmPaths(farmId);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.getUpcomingTasks(farmId, limit);
      if (response.success) {
        setTasks(sortTasksForDisplay((response.data as FarmTask[]) || []));
      } else {
        setError(response.error || 'Could not load tasks');
      }
    } catch {
      setError('Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [farmId, limit]);

  useEffect(() => {
    if (farmId) fetchTasks();
  }, [farmId, fetchTasks]);

  const handleComplete = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      const response = await apiClient.updateTask(farmId, taskId, { status: 'completed' });
      if (!response.success) {
        throw new Error(response.error || 'Could not update task');
      }
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark task as done');
    } finally {
      setCompletingId(null);
    }
  };

  const overdueCount = tasks.filter((t) => getDueLabel(t.dueDate).tone === 'overdue').length;
  const todayCount = tasks.filter((t) => getDueLabel(t.dueDate).tone === 'today').length;

  return (
    <>
      <div
        className={`overflow-hidden bg-white dark:bg-gray-800 rounded-lg max-md:rounded-2xl shadow max-md:shadow-md border border-transparent max-md:border-gray-100/90 dark:max-md:border-gray-700/80 ${className}`}
      >
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 max-md:py-3.5 md:px-5 md:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 md:flex">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg max-md:text-base font-bold text-gray-900 dark:text-white">
                  Upcoming tasks
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                  {loading
                    ? 'Loading your farm jobs…'
                    : tasks.length === 0
                      ? 'Plan chores so nothing gets missed'
                      : overdueCount > 0
                        ? `${overdueCount} overdue · ${todayCount} due today`
                        : todayCount > 0
                          ? `${todayCount} due today`
                          : `${tasks.length} open job${tasks.length === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
            {showViewAll && (
              <Link
                href={farmPath('/dashboard/tasks')}
                className="shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                View more
              </Link>
            )}
          </div>
        </div>

        <div>
          {loading ? (
            <div className="space-y-0 p-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 px-3 py-4 animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={fetchTasks}>
                Try again
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="px-6 py-8 text-center md:py-10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                <ClipboardList className="h-7 w-7" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">All clear for now</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                Add feeding rounds, egg collection, or vet visits so your team knows what&apos;s next.
              </p>
              <Button type="button" className="mt-5 gap-2" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />
                Add first task
              </Button>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onComplete={handleComplete}
                completingId={completingId}
              />
            ))
          )}
        </div>

        {!loading && tasks.length > 0 && (
          <div className="border-t border-gray-100 p-4 dark:border-gray-700 max-md:p-3 space-y-2">
            {showViewAll && tasks.length >= limit && (
              <Link
                href={farmPath('/dashboard/tasks')}
                className="flex min-h-10 w-full items-center justify-center rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
              >
                View more tasks
              </Link>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 min-h-11 rounded-xl border-dashed border-primary-300 text-primary-700 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-300 dark:hover:bg-primary-950/30"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        farmId={farmId}
        onSuccess={fetchTasks}
      />
    </>
  );
}
