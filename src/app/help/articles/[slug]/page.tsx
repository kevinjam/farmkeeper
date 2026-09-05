'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import HelpArticlePage from '@/components/help/HelpArticlePage';
import { getLocaleFromPathname } from '@/lib/farmPaths';

function PublicHelpArticleContent({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showArticle, setShowArticle] = useState(false);

  useEffect(() => {
    const farmSlug = localStorage.getItem('farmSlug') || '';
    const hasSession = Boolean(
      localStorage.getItem('auth-token') || document.cookie.split(';').some((part) => part.trim().startsWith('token='))
    );
    const safeSlug = /^[a-z0-9-]{3,50}$/i.test(farmSlug) ? farmSlug : '';

    if (hasSession && safeSlug) {
      const locale = getLocaleFromPathname(pathname);
      router.replace(`/${locale}/${safeSlug}/dashboard/help/articles/${slug}`);
      return;
    }
    setShowArticle(true);
  }, [pathname, router, slug]);

  if (!showArticle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
        Opening Help & Support…
      </div>
    );
  }

  const locale = getLocaleFromPathname(pathname);
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 p-3 dark:bg-gray-900">
      <HelpArticlePage basePath={`/${locale}/help`} slug={slug} />
    </div>
  );
}

export default function PublicHelpArticleRoute({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
          Opening Help & Support…
        </div>
      }
    >
      <PublicHelpArticleContent slug={params.slug} />
    </Suspense>
  );
}
