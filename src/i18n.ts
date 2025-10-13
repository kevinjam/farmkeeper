import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'lg', 'sw'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Default to English if locale is missing or invalid
  const resolvedLocale = locales.includes(locale as any) ? (locale as Locale) : 'en';

  // If the locale param is present but invalid, 404
  if (locale && !locales.includes(locale as any)) notFound();

  return {
    locale: resolvedLocale,
    messages: (await import(`../public/locales/${resolvedLocale}/common.json`)).default
  };
});

export { locales };
