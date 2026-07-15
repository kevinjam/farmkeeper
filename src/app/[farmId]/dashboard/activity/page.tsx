'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Beef,
  CheckCircle2,
  ClipboardList,
  Egg,
  History,
  Leaf,
  Loader2,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import {
  ACTIVITY_FILTER_TYPES,
  ACTIVITY_STYLES,
  ActivityFilter,
  ActivityType,
  FarmActivity,
  filterActivities,
  formatRelativeTime,
  getActivityCategory,
  getActivityLabel,
  groupActivitiesByDate,
} from '@/lib/activity';
import { useFarmPaths } from '@/hooks/useFarmPaths';

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'livestock', label: 'Livestock' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'crops', label: 'Crops' },
  { id: 'finances', label: 'Finances' },
  { id: 'tasks', label: 'Tasks' },
];

function getTypeIcon(type: ActivityType) {
  const category = getActivityCategory(type);
  if (type === 'egg_collection') return Egg;
  if (type === 'egg_sale' || type === 'income_recorded') return TrendingUp;
  if (type === 'expense_added') return TrendingDown;
  if (type === 'livestock_added') return PlusCircle;
  if (type === 'task_completed') return CheckCircle2;
  const map = { livestock: Beef, eggs: Egg, crops: Leaf, finances: Wallet, tasks: ClipboardList, other: Activity };
  return map[category] || Activity;
}

export default function ActivityPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const { farmPath } = useFarmPaths(farmId);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.getRecentActivities(farmId, 100);
      if (response.success) {
        setActivities((response.data as FarmActivity[]) || []);
      } else {
        setError(response.error || 'Could not load activity');
      }
    } catch {
      setError('Could not load activity');
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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

  return (
    <div className="-mx-3 flex min-h-[calc(100dvh-5.5rem)] flex-col overflow-hidden rounded-none border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-900 sm:-mx-6 lg:-mx-8 max-md:min-h-[calc(100dvh-8rem)] max-md:pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:min-h-[calc(100dvh-4.5rem)] md:rounded-xl">
      <div className="shrink-0 border-b border-gray-200 bg-gradient-to-r from-sky-50/80 via-white to-white px-4 py-4 dark:border-gray-800 dark:from-sky-950/20 dark:via-gray-900 dark:to-gray-900 sm:px-6 md:px-8 md:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 md:h-12 md:w-12">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Farm activity</h1>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                A timeline of everything happening on your farm
              </p>
            </div>
          </div>
          <Link
            href={farmPath('/dashboard')}
            className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:self-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="shrink-0 border-b border-gray-200 bg-gray-50/90 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60 sm:px-6 md:px-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                filter === f.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-80">({filterCounts[f.id]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <History className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">No activity to show</p>
            <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all'
                ? 'Start using the farm — add animals, record eggs, or log finances.'
                : `No ${filter} activity yet. Try another filter or add a record.`}
            </p>
            <Button type="button" variant="outline" className="mt-5" onClick={fetchActivities}>
              Refresh
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {groups.map((group) => (
              <section key={group.key}>
                <h2 className="sticky top-0 z-10 bg-gray-50/95 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 backdrop-blur dark:bg-gray-900/90 dark:text-gray-400 sm:px-6 md:px-8">
                  {group.label}
                </h2>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {group.items.map((item) => {
                    const category = getActivityCategory(item.activityType);
                    const styles = ACTIVITY_STYLES[category] || ACTIVITY_STYLES.other;
                    const Icon = getTypeIcon(item.activityType);
                    return (
                      <li
                        key={item._id}
                        className="flex gap-4 px-4 py-4 sm:px-6 md:px-8 md:py-5"
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconWrap}`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}
                            >
                              {getActivityLabel(item.activityType)}
                            </span>
                            <time className="text-xs text-gray-400 dark:text-gray-500">
                              {formatRelativeTime(item.createdAt)}
                            </time>
                          </div>
                          <p className="mt-1 font-medium text-gray-900 dark:text-white">{item.description}</p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {item.user?.name || 'Farm team'}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
