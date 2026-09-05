'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';
import CropActivityTypeIcon from '@/components/crops/CropActivityTypeIcon';
import { apiClient } from '@/lib/api';
import {
  formatCropActivityDayLabel,
  formatCropActivityType,
  type CropActivityRecord,
} from '@/lib/cropActivities';
import { useFarmPaths } from '@/hooks/useFarmPaths';

const PREVIEW_LIMIT = 3;

type RecentCropActivity = CropActivityRecord & {
  cropName?: string;
};

export default function RecentCropActivityCard({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const [activities, setActivities] = useState<RecentCropActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const response = await apiClient.getRecentCropActivities(farmId, PREVIEW_LIMIT);
      if (!response.success) {
        setActivities([]);
        return;
      }
      setActivities((response.data || []) as RecentCropActivity[]);
    } catch (err) {
      console.error('Error fetching recent crop activities:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  if (loading || activities.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-100/90 max-md:shadow-md dark:max-md:border-gray-700/80">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Sprout className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent work</h3>
            <p className="truncate text-[11px] text-gray-500">Latest crop activity</p>
          </div>
        </div>
        <Link
          href={farmPath('/dashboard/crops')}
          className="shrink-0 text-xs font-semibold text-primary-600 dark:text-primary-400"
        >
          View
        </Link>
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-gray-700/80">
        {activities.map((activity) => {
          const cropName = activity.cropName || 'Crop';
          const typeLabel = formatCropActivityType(activity);
          const dayLabel = formatCropActivityDayLabel(activity.activityDate || activity.date);
          return (
            <li key={activity._id}>
              <Link
                href={farmPath(`/dashboard/crops/${activity.cropId}`)}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  <CropActivityTypeIcon type={activity.activityType} className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{typeLabel}</p>
                  <p className="truncate text-[11px] text-gray-500">{cropName}</p>
                </div>
                {dayLabel ? (
                  <p className="shrink-0 text-[11px] font-medium text-gray-400">{dayLabel}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
