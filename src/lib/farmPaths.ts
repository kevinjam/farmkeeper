const SUPPORTED_LOCALES = ['en', 'lg', 'sw'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

/** Strip leading /en, /lg, or /sw from a pathname. */
export function stripLocaleFromPathname(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|lg|sw)(?=\/|$)/, '');
  return stripped || '/';
}

/** Read locale from pathname, or default to en. */
export function getLocaleFromPathname(pathname: string): AppLocale {
  const match = pathname.match(/^\/(en|lg|sw)(?=\/|$)/);
  if (match && SUPPORTED_LOCALES.includes(match[1] as AppLocale)) {
    return match[1] as AppLocale;
  }
  return 'en';
}

/**
 * Build a farm dashboard URL with locale prefix (matches production middleware).
 * @param farmId farm slug
 * @param pathSuffix e.g. `/dashboard/livestock`
 */
export function buildFarmPath(
  farmId: string,
  pathSuffix: string,
  locale: AppLocale = 'en'
): string {
  const suffix = pathSuffix.startsWith('/') ? pathSuffix : `/${pathSuffix}`;
  return `/${locale}/${farmId}${suffix}`;
}
