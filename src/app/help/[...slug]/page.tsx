'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import HelpLanding from '@/components/help/HelpLanding';
import { getLocaleFromPathname } from '@/lib/farmPaths';

function PublicHelpFallbackContent() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  return (
    <div className="min-h-[100dvh] bg-gray-50 px-4 py-6 dark:bg-gray-900">
      <HelpLanding basePath={`/${locale}/help`} missing />
    </div>
  );
}

export default function PublicHelpFallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
          Opening Help & Support…
        </div>
      }
    >
      <PublicHelpFallbackContent />
    </Suspense>
  );
}
