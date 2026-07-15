/** Plan feature helpers — mirrors backend `constants/plans.ts` */

export function hasFeatureAccess(
  features: string[],
  required: string | string[],
  unlockAll = false
): boolean {
  if (unlockAll) return true;
  const requiredList = Array.isArray(required) ? required : [required];
  if (requiredList.length === 0) return true;
  return requiredList.every((feature) => features.includes(feature));
}

/** Resolve gated feature for a dashboard path (locale already stripped). */
export function getGatedFeatureForDashboardPath(
  pathnameWithoutLocale: string,
  farmId: string
): string | null {
  const base = `/${farmId}/dashboard`;
  if (!pathnameWithoutLocale.startsWith(base)) return null;

  const sub = pathnameWithoutLocale.slice(base.length) || '/';
  if (sub === '/' || sub.startsWith('/billing') || sub.startsWith('/subscription')) {
    return null;
  }
  if (sub.startsWith('/finances')) return 'finances';
  if (sub.startsWith('/feed')) return 'feed_management';
  if (sub.startsWith('/eggs')) return 'eggs_sales';
  if (sub.startsWith('/analytics')) return 'analytics';
  return null;
}

export function canAccessDashboardPath(
  pathnameWithoutLocale: string,
  farmId: string,
  features: string[],
  unlockAll = false
): boolean {
  const required = getGatedFeatureForDashboardPath(pathnameWithoutLocale, farmId);
  if (!required) return true;
  return hasFeatureAccess(features, required, unlockAll);
}
