'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Beef,
  CheckCircle2,
  ClipboardList,
  Egg,
  History,
  Leaf,
  Loader2,
  PlusCircle,
  Sprout,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import {
  ACTIVITY_STYLES,
  ActivityType,
  FarmActivity,
  formatRelativeTime,
  getActivityCategory,
  getActivityHref,
  getActivityLabel,
  groupActivitiesByDate,
} from '@/lib/activity';
import { useFarmPaths } from '@/hooks/useFarmPaths';

const ICONS: Record<string, typeof Activity> = {
  livestock: Beef,
  eggs: Egg,
  crops: Leaf,
  finances: Wallet,
  tasks: ClipboardList,
  other: Activity,
};

function getTypeIcon(type: ActivityType) {
  if (type === 'egg_collection') return Egg;
  if (type === 'egg_sale') return TrendingUp;
  if (type === 'crop_harvested') return Sprout;
  if (type === 'crop_sale') return TrendingUp;
  if (type === 'expense_added') return TrendingDown;
  if (type === 'income_recorded') return TrendingUp;
  if (type === 'livestock_added') return PlusCircle;
  if (type === 'task_completed') return CheckCircle2;
  return ICONS[getActivityCategory(type)] || Activity;
}

function ActivityRow({ item, href }: { item: FarmActivity; href?: string | null }) {
  const category = getActivityCategory(item.activityType);
  const styles = ACTIVITY_STYLES[category] || ACTIVITY_STYLES.other;
  const Icon = getTypeIcon(item.activityType);
  const content = (
    <div className="flex gap-3 px-4 py-3.5 md:px-4 md:py-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconWrap}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}>
            {getActivityLabel(item.activityType)}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium leading-snug text-gray-900 dark:text-white">{item.description}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {item.user?.name || 'Farm team'}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:bg-gray-50 dark:hover:bg-gray-800/60">
        {content}
      </Link>
    );
  }
  return content;
}

interface RecentActivityCardProps {
  farmId: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function RecentActivityCard({
  farmId,
  limit = 3,
  showViewAll = true,
  className = '',
}: RecentActivityCardProps) {
  const { farmPath } = useFarmPaths(farmId);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActivities = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.getRecentActivities(farmId, limit);
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
  }, [farmId, limit]);

  useEffect(() => {
    if (farmId) fetchActivities();
  }, [farmId, fetchActivities]);

  const groups = groupActivitiesByDate(activities);

  return (
    <div
      className={`overflow-hidden bg-white dark:bg-gray-800 rounded-lg max-md:rounded-2xl shadow max-md:shadow-md border border-transparent max-md:border-gray-100/90 dark:max-md:border-gray-700/80 ${className}`}
    >
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 max-md:py-3.5 md:px-5 md:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 md:flex">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg max-md:text-base font-bold text-gray-900 dark:text-white">Recent activity</h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                {loading
                  ? 'Loading farm updates…'
                  : activities.length === 0
                    ? 'Actions on your farm appear here'
                    : `${activities.length} recent update${activities.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
          {showViewAll && (
            <Link
              href={farmPath('/dashboard/activity')}
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
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={fetchActivities}>
              Try again
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="px-6 py-8 text-center md:py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
              <Sprout className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-gray-900 dark:text-white">No activity yet</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
              Add a crop or livestock so your farm activity starts showing up here.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href={farmPath('/dashboard/crops/add')}
                className="btn btn-primary inline-flex min-h-11 items-center justify-center"
              >
                Add crop
              </Link>
              <Link
                href={farmPath('/dashboard/livestock/add')}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                Add livestock
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {groups.map((group) => (
                <div key={group.key}>
                  <p className="bg-gray-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-900/50 dark:text-gray-400 md:px-5">
                    {group.label}
                  </p>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {group.items.map((item) => {
                      const path = getActivityHref(item);
                      return <ActivityRow key={item._id} item={item} href={path ? farmPath(path) : null} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
            {showViewAll && activities.length >= limit && (
              <div className="border-t border-gray-100 p-3 dark:border-gray-700 md:p-4">
                <Link
                  href={farmPath('/dashboard/activity')}
                  className="flex min-h-10 w-full items-center justify-center rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
                >
                  View more activity
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
