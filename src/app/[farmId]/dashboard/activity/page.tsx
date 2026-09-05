'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Beef,
  Check,
  CheckCircle2,
  ClipboardList,
  Egg,
  History,
  Leaf,
  Loader2,
  Plus,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import {
  ACTIVITY_FILTER_TYPES,
  ActivityFilter,
  ActivityType,
  FarmActivity,
  filterActivities,
  formatRelativeTime,
  getActivityCategory,
  getActivityHref,
  getActivityLabel,
  groupActivitiesByDate,
} from '@/lib/activity';
import { FarmTask } from '@/lib/tasks';
import { useFarmPaths } from '@/hooks/useFarmPaths';

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'livestock', label: 'Livestock' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'crops', label: 'Crops' },
  { id: 'finances', label: 'Finances' },
  { id: 'tasks', label: 'Tasks' },
];

function getTimelineTone(type: ActivityType): {
  node: string;
  badge: string;
  Icon: typeof Check;
} {
  if (type === 'task_completed') {
    return {
      node: 'bg-primary-500 text-white ring-primary-500/30',
      badge: 'bg-primary-500/15 text-primary-700 dark:text-primary-300',
      Icon: Check,
    };
  }
  if (type === 'task_created') {
    return {
      node: 'bg-amber-500 text-white ring-amber-500/30',
      badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
      Icon: Plus,
    };
  }
  if (type === 'expense_added') {
    return {
      node: 'bg-rose-500 text-white ring-rose-500/30',
      badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
      Icon: TrendingDown,
    };
  }
  if (type === 'income_recorded' || type === 'egg_sale' || type === 'crop_sale') {
    return {
      node: 'bg-sky-500 text-white ring-sky-500/30',
      badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
      Icon: TrendingUp,
    };
  }
  if (type === 'livestock_added' || type === 'egg_collection') {
    return {
      node: 'bg-emerald-500 text-white ring-emerald-500/30',
      badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
      Icon: type === 'egg_collection' ? Egg : PlusCircle,
    };
  }
  if (getActivityCategory(type) === 'crops') {
    return {
      node: 'bg-lime-600 text-white ring-lime-500/30',
      badge: 'bg-lime-500/15 text-lime-800 dark:text-lime-300',
      Icon: Leaf,
    };
  }
  const category = getActivityCategory(type);
  const fallback =
    category === 'livestock'
      ? Beef
      : category === 'finances'
        ? Wallet
        : category === 'tasks'
          ? ClipboardList
          : Activity;
  return {
    node: 'bg-gray-500 text-white ring-gray-400/30',
    badge: 'bg-gray-500/15 text-gray-700 dark:text-gray-300',
    Icon: fallback,
  };
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function ActivityPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const { farmPath } = useFarmPaths(farmId);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [openTasks, setOpenTasks] = useState<FarmTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [activityRes, openRes, doneRes] = await Promise.all([
        apiClient.getRecentActivities(farmId, 100),
        apiClient.getUpcomingTasks(farmId, 50),
        apiClient.getTasks(farmId, { status: 'completed', limit: 100 }),
      ]);

      if (activityRes.success) {
        setActivities((activityRes.data as FarmActivity[]) || []);
      } else {
        setError(activityRes.error || 'Could not load activity');
      }

      if (openRes.success) {
        setOpenTasks((openRes.data as FarmTask[]) || []);
      }
      if (doneRes.success) {
        setCompletedTasks((doneRes.data as FarmTask[]) || []);
      }
    } catch {
      setError('Could not load activity');
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => filterActivities(activities, filter), [activities, filter]);
  const groups = useMemo(() => groupActivitiesByDate(filtered), [filtered]);

  const filterCounts = useMemo(() => {
    const counts: Record<ActivityFilter, number> = {
      all: activities.length,
      livestock: 0,
      eggs: 0,
      crops: 0,
      finances: 0,
      tasks: 0,
    };
    for (const key of Object.keys(ACTIVITY_FILTER_TYPES) as Exclude<ActivityFilter, 'all'>[]) {
      counts[key] = filterActivities(activities, key).length;
    }
    return counts;
  }, [activities]);

  const stats = useMemo(() => {
    const now = new Date();
    const completedTodayFromActivity = activities.filter(
      (a) =>
        a.activityType === 'task_completed' && isSameDay(new Date(a.createdAt), now)
    ).length;

    const totalTasks = openTasks.length + completedTasks.length;
    const efficiency =
      totalTasks === 0 ? 0 : Math.min(100, Math.round((completedTasks.length / totalTasks) * 100));

    return {
      totalTasks,
      doneToday: completedTodayFromActivity,
      efficiency,
    };
  }, [activities, openTasks, completedTasks]);

  return (
    <div className="relative space-y-5 max-md:pb-28 sm:space-y-6">
      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5 md:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-600/30 md:h-14 md:w-14">
            <History className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-[1.75rem]">
              Farm Activity
            </h1>
            <p className="mt-1 max-w-xl text-sm text-gray-500 dark:text-gray-400 md:text-[15px]">
              A real-time timeline of everything happening on your farm.
            </p>
          </div>
        </div>
        <Link
          href={farmPath('/dashboard')}
          className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:self-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-600/25'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 tabular-nums ${active ? 'opacity-90' : 'opacity-60'}`}>
                ({filterCounts[f.id]})
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900/60">
            <History className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">No activity to show</p>
            <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all'
                ? 'Start using the farm — add animals, record eggs, or log finances.'
                : `No ${filter} activity yet. Try another filter or add a record.`}
            </p>
            <Button type="button" variant="outline" className="mt-5 rounded-xl" onClick={fetchData}>
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <section key={group.key}>
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                  {group.label}
                </h2>
                <ol className="relative space-y-4 pl-2 sm:pl-3">
                  {/* Timeline rail */}
                  <div
                    className="absolute bottom-3 left-[19px] top-3 w-px bg-gradient-to-b from-primary-400/50 via-gray-300 to-transparent dark:from-primary-500/40 dark:via-gray-700 sm:left-[23px]"
                    aria-hidden
                  />

                  {group.items.map((item) => {
                    const tone = getTimelineTone(item.activityType);
                    const NodeIcon = tone.Icon;
                    const href = getActivityHref(item);
                    return (
                      <li key={item._id} className="relative flex gap-3 sm:gap-4">
                        <div
                          className={`relative z-10 mt-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-950 sm:mt-3.5 sm:h-10 sm:w-10 ${tone.node}`}
                        >
                          <NodeIcon className="h-4 w-4" strokeWidth={2.5} />
                        </div>

                        <div className="min-w-0 flex-1 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-900/80 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone.badge}`}
                                >
                                  {getActivityLabel(item.activityType)}
                                </span>
                                <time className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatRelativeTime(item.createdAt)}
                                </time>
                              </div>
                              {href ? (
                                <Link
                                  href={farmPath(href)}
                                  className="mt-2 block text-[15px] font-semibold leading-snug text-gray-900 hover:text-primary-700 dark:text-white"
                                >
                                  {item.description}
                                </Link>
                              ) : (
                                <p className="mt-2 text-[15px] font-semibold leading-snug text-gray-900 dark:text-white">
                                  {item.description}
                                </p>
                              )}
                              <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary-500" />
                                <span>{item.user?.name || 'Farm team'}</span>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span>Farm activity</span>
                              </p>
                            </div>
                            <span
                              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 dark:text-gray-600"
                              aria-hidden
                            >
                              <CheckCircle2 className="h-4 w-4 opacity-40" />
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats — floating on desktop, bottom card on mobile */}
      {!loading && (
        <aside className="pointer-events-none fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-20 w-[min(18rem,calc(100vw-1.5rem))] sm:bottom-6 sm:right-6 md:right-8 lg:right-10">
          <div className="pointer-events-auto rounded-2xl border border-primary-500/20 bg-white/95 p-4 shadow-xl shadow-black/10 backdrop-blur-md dark:border-primary-500/25 dark:bg-gray-900/95 dark:shadow-black/40">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
              <Zap className="h-3.5 w-3.5" />
              Quick stats
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/60">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Total tasks
                </p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                  {stats.totalTasks}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/60">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Completed today
                </p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-primary-600 dark:text-primary-400">
                  {String(stats.doneToday).padStart(2, '0')}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-500 dark:text-gray-400">Daily efficiency</span>
                <span className="font-bold tabular-nums text-gray-900 dark:text-white">
                  {stats.efficiency}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${stats.efficiency}%` }}
                />
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
