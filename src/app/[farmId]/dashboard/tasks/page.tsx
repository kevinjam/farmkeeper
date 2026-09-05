'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  TASK_AREA_LABELS,
  TaskArea,
  getDueLabel,
  getPriorityLabel,
  getTaskArea,
  getTaskIconKey,
  sortTasksForDisplay,
} from '@/lib/tasks';
import AddTaskModal from '@/components/dashboard/AddTaskModal';

const ICONS = {
  eggs: Egg,
  feed: Wheat,
  health: Stethoscope,
  water: Droplets,
  clean: Sparkles,
  sales: ShoppingBag,
  crops: Sprout,
  harvest: Wheat,
  general: ClipboardList,
} as const;

const ICON_STYLES = {
  eggs: 'bg-amber-100 text-amber-800 dark:bg-amber-900/45 dark:text-amber-300',
  feed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/45 dark:text-emerald-300',
  health: 'bg-rose-100 text-rose-800 dark:bg-rose-900/45 dark:text-rose-300',
  water: 'bg-sky-100 text-sky-800 dark:bg-sky-900/45 dark:text-sky-300',
  clean: 'bg-teal-100 text-teal-800 dark:bg-teal-900/45 dark:text-teal-300',
  sales: 'bg-violet-100 text-violet-800 dark:bg-violet-900/45 dark:text-violet-300',
  crops: 'bg-lime-100 text-lime-800 dark:bg-lime-900/45 dark:text-lime-300',
  harvest: 'bg-amber-100 text-amber-900 dark:bg-amber-900/45 dark:text-amber-200',
  general: 'bg-primary-100 text-primary-800 dark:bg-primary-900/45 dark:text-primary-300',
};

const AREA_FILTERS: { id: 'all' | TaskArea; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'crops', label: 'Crops' },
  { id: 'animals', label: 'Animals' },
  { id: 'farm', label: 'Farm' },
];

function matchesArea(task: FarmTask, area: 'all' | TaskArea) {
  return area === 'all' || getTaskArea(task.title) === area;
}

function groupOpenTasks(tasks: FarmTask[]) {
  const overdue: FarmTask[] = [];
  const today: FarmTask[] = [];
  const upcoming: FarmTask[] = [];

  for (const task of tasks) {
    const tone = getDueLabel(task.dueDate).tone;
    if (tone === 'overdue') overdue.push(task);
    else if (tone === 'today') today.push(task);
    else upcoming.push(task);
  }

  return [
    { id: 'overdue', title: 'Overdue', tasks: overdue },
    { id: 'today', title: 'Today', tasks: today },
    { id: 'upcoming', title: 'Upcoming', tasks: upcoming },
  ].filter((group) => group.tasks.length > 0);
}

function TaskRow({
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
  const area = getTaskArea(task.title);
  const isCompleting = completingId === task._id;
  const dueColor =
    due.tone === 'overdue'
      ? 'text-red-600 dark:text-red-400'
      : due.tone === 'today'
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-gray-500 dark:text-gray-400';

  const inner = (
    <>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[iconKey]}`}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">
          {task.title}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400">
          <span className={dueColor}>{due.compact}</span>
          <span className="text-gray-300 dark:text-gray-600"> · </span>
          {TASK_AREA_LABELS[area]}
          {task.priority === 'high' ? (
            <>
              <span className="text-gray-300 dark:text-gray-600"> · </span>
              <span className="text-red-600 dark:text-red-400">{getPriorityLabel(task.priority)}</span>
            </>
          ) : null}
        </p>
      </div>

      {showComplete ? (
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 text-primary-600 dark:border-gray-600 dark:text-primary-400"
          aria-hidden
        >
          {isCompleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
          )}
        </span>
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
        </span>
      )}
    </>
  );

  const rowClass =
    'flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-gray-50 dark:active:bg-gray-800/70 md:px-4 md:py-3.5 md:hover:bg-gray-50 dark:md:hover:bg-gray-800/50';

  if (showComplete) {
    return (
      <button
        type="button"
        onClick={() => onComplete(task._id)}
        disabled={isCompleting}
        className={`${rowClass} disabled:opacity-60`}
        aria-label={`Mark ${task.title} as done`}
      >
        {inner}
      </button>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}

export default function TasksPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const [openTasks, setOpenTasks] = useState<FarmTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'open' | 'done'>('open');
  const [areaFilter, setAreaFilter] = useState<'all' | TaskArea>('all');

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

  const visibleOpen = useMemo(
    () => openTasks.filter((task) => matchesArea(task, areaFilter)),
    [openTasks, areaFilter]
  );
  const visibleDone = useMemo(
    () => completedTasks.filter((task) => matchesArea(task, areaFilter)),
    [completedTasks, areaFilter]
  );

  const openGroups = useMemo(() => groupOpenTasks(visibleOpen), [visibleOpen]);
  const openCount = visibleOpen.length;
  const doneCount = visibleDone.length;

  const emptyCopy =
    filter === 'open'
      ? areaFilter === 'crops'
        ? 'Add weeding, fertilizing, or harvest.'
        : areaFilter === 'animals'
          ? 'Add feeding, eggs, or a health check.'
          : 'Add field work, feeding, or harvest.'
      : 'Finished tasks will land here.';

  return (
    <div className="flex flex-col max-md:-mx-3 max-md:min-h-[calc(100dvh-8.5rem)] max-md:pb-[calc(1rem+env(safe-area-inset-bottom))] md:gap-5 md:py-2">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-1 md:rounded-2xl md:border md:border-gray-200/90 md:bg-white md:px-5 md:py-4 md:shadow-sm dark:md:border-gray-700/80 dark:md:bg-gray-900/80">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Tasks
          </h1>
          <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
            {loading ? 'Loading…' : `${openCount} open · ${doneCount} done`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm shadow-primary-600/30 active:scale-95 md:hidden"
          aria-label="Add task"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <Button
          type="button"
          className="hidden min-h-10 gap-2 rounded-xl bg-primary-600 px-4 font-semibold md:inline-flex"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add task
        </Button>
      </div>

      {error && (
        <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 md:mx-0">
          {error}
        </div>
      )}

      <div className="px-4 md:px-0">
        <div className="grid grid-cols-4 rounded-xl bg-gray-100 p-1 dark:bg-gray-800/90">
          {AREA_FILTERS.map((item) => {
            const active = areaFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAreaFilter(item.id)}
                className={`rounded-lg py-2 text-[13px] font-semibold transition ${
                  active
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800/90">
          {(['open', 'done'] as const).map((key) => {
            const active = filter === key;
            const count = key === 'open' ? openCount : doneCount;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-lg py-2 text-[13px] font-semibold transition ${
                  active
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {key === 'open' ? 'Open' : 'Done'}
                {!loading && (
                  <span className={`ml-1 tabular-nums ${active ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex-1 px-4 md:mt-0 md:px-0">
        {loading ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900/70">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-gray-100 px-3.5 py-3 last:border-0 dark:border-gray-800"
              >
                <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filter === 'open' && openGroups.length === 0 ? (
          <EmptyState
            areaFilter={areaFilter}
            title="All clear"
            copy={emptyCopy}
            onAdd={() => setShowAddModal(true)}
          />
        ) : filter === 'done' && visibleDone.length === 0 ? (
          <EmptyState
            areaFilter={areaFilter}
            title="Nothing completed yet"
            copy={emptyCopy}
          />
        ) : filter === 'open' ? (
          <div className="space-y-4">
            {openGroups.map((group) => (
              <section key={group.id}>
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                    {group.title}
                  </h2>
                  <span className="text-[11px] font-semibold tabular-nums text-gray-400">
                    {group.tasks.length}
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900/80">
                  {group.tasks.map((task, index) => (
                    <div
                      key={task._id}
                      className={
                        index < group.tasks.length - 1
                          ? 'border-b border-gray-100 dark:border-gray-800'
                          : undefined
                      }
                    >
                      <TaskRow
                        task={task}
                        onComplete={handleComplete}
                        completingId={completingId}
                        showComplete
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900/80">
            {visibleDone.map((task, index) => (
              <div
                key={task._id}
                className={
                  index < visibleDone.length - 1
                    ? 'border-b border-gray-100 dark:border-gray-800'
                    : undefined
                }
              >
                <TaskRow
                  task={task}
                  onComplete={handleComplete}
                  completingId={completingId}
                  showComplete={false}
                />
              </div>
            ))}
          </div>
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

function EmptyState({
  areaFilter,
  title,
  copy,
  onAdd,
}: {
  areaFilter: 'all' | TaskArea;
  title: string;
  copy: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900/40">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
        {areaFilter === 'crops' ? (
          <Sprout className="h-6 w-6" />
        ) : areaFilter === 'animals' ? (
          <Egg className="h-6 w-6" />
        ) : (
          <ClipboardList className="h-6 w-6" />
        )}
      </div>
      <p className="text-base font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 max-w-[16rem] text-sm text-gray-500 dark:text-gray-400">{copy}</p>
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 text-sm font-semibold text-primary-600 dark:text-primary-400"
        >
          Add a task
        </button>
      ) : null}
    </div>
  );
}
