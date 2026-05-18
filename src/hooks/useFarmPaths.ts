'use client';

import { useParams, usePathname } from 'next/navigation';
import { buildFarmPath, getLocaleFromPathname } from '@/lib/farmPaths';

/**
 * Build locale-prefixed farm dashboard URLs (e.g. /en/my-farm/dashboard/livestock/add).
 */
export function useFarmPaths(fallbackFarmId?: string) {
  const params = useParams();
  const pathname = usePathname();
  const farmId = (params?.farmId as string) || fallbackFarmId || '';
  const locale = getLocaleFromPathname(pathname);

  const farmPath = (pathSuffix: string) => buildFarmPath(farmId, pathSuffix, locale);

  return { farmId, locale, farmPath };
}
