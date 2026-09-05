'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import HelpLanding from '@/components/help/HelpLanding';
import { getLocaleFromPathname } from '@/lib/farmPaths';

function PublicHelpContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const slug = localStorage.getItem('farmSlug') || '';
    const hasSession = Boolean(
      localStorage.getItem('auth-token') || document.cookie.split(';').some((part) => part.trim().startsWith('token='))
    );
    const safeSlug = /^[a-z0-9-]{3,50}$/i.test(slug) ? slug : '';

    if (hasSession && safeSlug) {
      const locale = getLocaleFromPathname(pathname);
      const query = searchParams.toString();
      router.replace(`/${locale}/${safeSlug}/dashboard/help${query ? `?${query}` : ''}`);
      return;
    }
    setShowLanding(true);
  }, [pathname, router, searchParams]);

  if (!showLanding) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
        Opening Help & Support…
      </div>
    );
  }

  const locale = getLocaleFromPathname(pathname);
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 p-3 dark:bg-gray-900">
      <HelpLanding basePath={`/${locale}/help`} />
    </div>
  );
}

export default function PublicHelpPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
          Opening Help & Support…
        </div>
      }
    >
      <PublicHelpContent />
    </Suspense>
  );
}
