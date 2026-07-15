'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ClipboardList, Loader2, Plus, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { FarmTask, getDueLabel, getPriorityLabel, sortTasksForDisplay } from '@/lib/tasks';
import AddTaskModal from '@/components/dashboard/AddTaskModal';
import { useFarmPaths } from '@/hooks/useFarmPaths';

const DUE_STYLES = {
  overdue: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  today: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200',
  soon: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  later: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function TasksPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const { farmPath } = useFarmPaths(farmId);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'open' | 'done'>('open');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response =
        filter === 'open'
          ? await apiClient.getUpcomingTasks(farmId, 50)
          : await apiClient.getTasks(farmId, { status: 'completed', limit: 50 });

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
  }, [farmId, filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleComplete = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      const response = await apiClient.updateTask(farmId, taskId, { status: 'completed' });
      if (!response.success) throw new Error(response.error);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update task');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="-mx-3 flex min-h-[calc(100dvh-5.5rem)] flex-col overflow-hidden rounded-none border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-900 sm:-mx-6 lg:-mx-8 max-md:min-h-[calc(100dvh-8rem)] max-md:pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:min-h-[calc(100dvh-4.5rem)] md:rounded-xl">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 bg-gradient-to-r from-primary-50/80 via-white to-white px-4 py-4 dark:border-gray-800 dark:from-primary-950/30 dark:via-gray-900 dark:to-gray-900 sm:px-6 md:px-8 md:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 md:h-12 md:w-12">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Farm tasks</h1>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                Everything on your to-do list for the farm
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Link
              href={farmPath('/dashboard')}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <Button type="button" className="min-h-10 gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="shrink-0 border-b border-gray-200 bg-gray-50/90 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60 sm:px-6 md:px-8">
        <div className="flex gap-2">
          {(['open', 'done'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {key === 'open' ? 'Open' : 'Completed'}
            </button>
          ))}
          {!loading && (
            <span className="ml-auto self-center text-sm text-gray-500 dark:text-gray-400">
              {tasks.length} task{tasks.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      {/* Task list — fills remaining height */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-500">
            <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center md:py-28">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
              <ClipboardList className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {filter === 'open' ? 'No open tasks' : 'No completed tasks yet'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              {filter === 'open'
                ? 'Add feeding, egg collection, or health checks to stay on top of farm work.'
                : 'Completed tasks will show up here after you mark them done.'}
            </p>
            {filter === 'open' && (
              <Button type="button" className="mt-6 gap-2" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />
                Add your first task
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.map((task) => {
              const due = getDueLabel(task.dueDate);
              return (
                <li
                  key={task._id}
                  className={`flex items-center gap-4 px-4 py-4 sm:px-6 md:px-8 md:py-5 ${
                    due.tone === 'overdue' && filter === 'open'
                      ? 'bg-red-50/50 dark:bg-red-950/10'
                      : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${DUE_STYLES[due.tone]}`}
                      >
                        {due.label}
                      </span>
                    </div>
                    {task.description && task.description !== task.title && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {task.description}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      {getPriorityLabel(task.priority)}
                    </p>
                  </div>
                  {filter === 'open' && (
                    <button
                      type="button"
                      onClick={() => handleComplete(task._id)}
                      disabled={completingId === task._id}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-primary-600 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-primary-400 dark:hover:bg-primary-950/30"
                      aria-label="Mark done"
                    >
                      {completingId === task._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        farmId={farmId}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
