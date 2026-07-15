'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Droplets,
  Egg,
  Filter,
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
import AddTaskModal from '@/components/dashboard/AddTaskModal';
import { useFarmPaths } from '@/hooks/useFarmPaths';

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
  eggs: 'bg-amber-100 text-amber-800 dark:bg-amber-900/45 dark:text-amber-300',
  feed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/45 dark:text-emerald-300',
  health: 'bg-rose-100 text-rose-800 dark:bg-rose-900/45 dark:text-rose-300',
  water: 'bg-sky-100 text-sky-800 dark:bg-sky-900/45 dark:text-sky-300',
  clean: 'bg-teal-100 text-teal-800 dark:bg-teal-900/45 dark:text-teal-300',
  sales: 'bg-violet-100 text-violet-800 dark:bg-violet-900/45 dark:text-violet-300',
  general: 'bg-primary-100 text-primary-800 dark:bg-primary-900/45 dark:text-primary-300',
};

const DUE_STYLES = {
  overdue: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  today: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200',
  soon: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  later: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

function isTomorrow(dueDate: string): boolean {
  return getDueLabel(dueDate).label === 'Tomorrow';
}

function ProgressRing({ percent, size = 128 }: { percent: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary-500 transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-[1.65rem]">
          {clamped}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Done
        </span>
      </div>
    </div>
  );
}

function TaskListCard({
  task,
  onComplete,
  completingId,
  showComplete,
}: {
  task: FarmTask;
  onComplete: (id: string) => void;
  completingId: string | null;
  showComplete: boolean;
}) {
  const iconKey = getTaskIconKey(task.title);
  const Icon = ICONS[iconKey];
  const due = getDueLabel(task.dueDate);
  const isCompleting = completingId === task._id;
  const accent =
    due.tone === 'overdue'
      ? 'bg-red-500'
      : due.tone === 'today'
        ? 'bg-primary-500'
        : 'bg-primary-400/70';

  const cardClassName = `relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition dark:bg-gray-900/80 md:gap-4 md:p-5 ${
    due.tone === 'overdue'
      ? 'border-red-200/80 dark:border-red-900/50'
      : 'border-gray-200/90 dark:border-gray-700/80'
  } ${
    showComplete
      ? 'cursor-pointer hover:border-primary-300 hover:bg-primary-50/40 active:scale-[0.99] dark:hover:border-primary-700 dark:hover:bg-primary-950/25 disabled:cursor-wait disabled:opacity-70'
      : ''
  }`;

  const inner = (
    <>
      <div className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full ${accent}`} />

      <div
        className={`ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12 ${ICON_STYLES[iconKey]}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white md:text-base">
            {task.title}
          </h3>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${DUE_STYLES[due.tone]}`}
          >
            {due.label}
          </span>
        </div>
        {task.description && task.description !== task.title && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {task.description}
          </p>
        )}
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {getPriorityLabel(task.priority)}
        </p>
      </div>

      {showComplete && (
        <span
          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50 text-primary-600 dark:border-gray-600 dark:bg-gray-800 dark:text-primary-400"
          aria-hidden
        >
          {isCompleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-5 w-5" strokeWidth={2.5} />
          )}
        </span>
      )}
    </>
  );

  if (showComplete) {
    return (
      <button
        type="button"
        onClick={() => onComplete(task._id)}
        disabled={isCompleting}
        className={cardClassName}
        aria-label={`Mark ${task.title} as done`}
      >
        {inner}
      </button>
    );
  }

  return <div className={cardClassName}>{inner}</div>;
}

function TomorrowCard({
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
  const isCompleting = completingId === task._id;

  return (
    <button
      type="button"
      onClick={() => onComplete(task._id)}
      disabled={isCompleting}
      className="flex min-w-[15rem] flex-1 items-center gap-3 rounded-2xl border border-gray-200/90 bg-white p-4 text-left shadow-sm transition hover:border-primary-300 hover:bg-primary-50/40 active:scale-[0.99] disabled:opacity-70 dark:border-gray-700/80 dark:bg-gray-900/80 dark:hover:border-primary-700 dark:hover:bg-primary-950/25"
      aria-label={`Mark ${task.title} as done`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[iconKey]}`}
      >
        {isCompleting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-900 dark:text-white">{task.title}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
          {task.description && task.description !== task.title
            ? task.description
            : 'Scheduled for tomorrow'}
        </p>
      </div>
    </button>
  );
}

export default function TasksPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const { farmPath } = useFarmPaths(farmId);
  const [openTasks, setOpenTasks] = useState<FarmTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'open' | 'done'>('open');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [openRes, doneRes] = await Promise.all([
        apiClient.getUpcomingTasks(farmId, 50),
        apiClient.getTasks(farmId, { status: 'completed', limit: 50 }),
      ]);

      if (openRes.success) {
        setOpenTasks(sortTasksForDisplay((openRes.data as FarmTask[]) || []));
      } else {
        setError(openRes.error || 'Could not load tasks');
      }

      if (doneRes.success) {
        setCompletedTasks((doneRes.data as FarmTask[]) || []);
      }
    } catch {
      setError('Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [farmId]);

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

  const tomorrowTasks = useMemo(
    () => openTasks.filter((t) => isTomorrow(t.dueDate)),
    [openTasks]
  );

  const mainOpenTasks = useMemo(
    () => openTasks.filter((t) => !isTomorrow(t.dueDate)),
    [openTasks]
  );

  const listTasks = filter === 'open' ? mainOpenTasks : completedTasks;
  const openCount = openTasks.length;
  const doneCount = completedTasks.length;
  const totalCount = openCount + doneCount;
  const progressPercent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="space-y-4 max-md:pb-4 sm:space-y-5">
      {/* Hero */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/80 sm:flex-row sm:items-center sm:p-5 md:gap-5 md:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-md shadow-primary-600/25 md:h-16 md:w-16">
            <Sprout className="h-8 w-8" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white md:text-2xl">
              Farm tasks
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 md:text-[15px]">
              Everything on your to-do list for the farm today.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                href={farmPath('/dashboard')}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
              <Button
                type="button"
                className="min-h-10 gap-2 rounded-xl bg-primary-600 px-4 font-semibold shadow-sm hover:bg-primary-700"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Add task
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200/90 bg-white px-4 py-5 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/80">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          ) : (
            <>
              <ProgressRing percent={progressPercent} size={120} />
              <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {doneCount} of {totalCount || openCount}
                </span>{' '}
                tasks completed
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100/80 p-1 dark:border-gray-700 dark:bg-gray-800/80">
          {(['open', 'done'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filter === key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {key === 'open' ? 'Open' : 'Completed'}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {!loading && (
            <span>
              {filter === 'open'
                ? `${openCount} task${openCount === 1 ? '' : 's'} remaining`
                : `${doneCount} completed`}
            </span>
          )}
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500"
            aria-hidden
          >
            <Filter className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[5.5rem] animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/60"
              />
            ))}
          </div>
        ) : listTasks.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900/50">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
              <ClipboardList className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {filter === 'open' ? 'No open tasks for today' : 'No completed tasks yet'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              {filter === 'open'
                ? 'Add feeding, egg collection, or health checks to stay on top of farm work.'
                : 'Completed tasks will show up here after you mark them done.'}
            </p>
            {filter === 'open' && (
              <Button type="button" className="mt-6 gap-2 rounded-xl" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" />
                Add your first task
              </Button>
            )}
          </div>
        ) : (
          listTasks.map((task) => (
            <TaskListCard
              key={task._id}
              task={task}
              onComplete={handleComplete}
              completingId={completingId}
              showComplete={filter === 'open'}
            />
          ))
        )}
      </div>

      {/* Upcoming tomorrow */}
      {filter === 'open' && !loading && tomorrowTasks.length > 0 && (
        <section className="pt-1">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
            Upcoming tomorrow
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible">
            {tomorrowTasks.map((task) => (
              <TomorrowCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                completingId={completingId}
              />
            ))}
          </div>
        </section>
      )}

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        farmId={farmId}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
