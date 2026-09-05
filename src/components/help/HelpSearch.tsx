'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { getHelpCategory, helpArticlePath, popularHelpArticles, searchHelpArticles } from '@/lib/help';
import HelpSupportCta from './HelpSupportCta';
import { HelpBackLink, HelpPageShell, helpFocus } from './HelpPageShell';

export default function HelpSearch({ basePath }: { basePath: string }) {
  const { t } = useTranslations('common');
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const results = useMemo(() => (trimmed ? searchHelpArticles(trimmed) : []), [trimmed]);
  const popular = popularHelpArticles();

  return (
    <HelpPageShell
      icon={<Search className="h-6 w-6" strokeWidth={2} />}
      title={t('help.searchTitle', 'Search Help')}
      subtitle={t('help.searchHint', 'Search articles by title, topic, or keyword.')}
      crumbs={[
        { href: basePath, label: 'Help' },
        { href: `${basePath}?section=search`, label: 'Search' },
      ]}
    >
      <div className="space-y-5">
        <label className="relative block">
          <span className="sr-only">{t('help.searchPlaceholder', 'Search FarmKeeper Help')}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('help.searchPlaceholder', 'Search FarmKeeper Help')}
            autoComplete="off"
            autoFocus
            className="block w-full rounded-2xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-gray-600 dark:bg-gray-900 dark:text-white [font-size:16px]"
          />
        </label>

        {trimmed && results.length > 0 ? (
          <ul
            aria-live="polite"
            className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700"
          >
            {results.map((article) => (
              <li key={article.slug}>
                <Link
                  href={helpArticlePath(basePath, article.slug)}
                  className={`flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/80 ${helpFocus}`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{article.title}</span>
                    <span className="mt-0.5 block text-[13px] text-gray-500 dark:text-gray-400">
                      {getHelpCategory(article.categoryId)?.label || 'Help'} · {article.description}
                    </span>
                  </span>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {trimmed && results.length === 0 ? (
          <div role="status" className="rounded-2xl border border-dashed border-gray-200 px-5 py-6 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('help.noAnswer', "We couldn't find an answer.")}
            </p>
            <p className="mt-1 text-sm text-gray-500">Try another keyword, or send a support request.</p>
            <div className="mt-4">
              <HelpSupportCta helpBasePath={basePath} heading={false} />
            </div>
          </div>
        ) : null}

        {!trimmed ? (
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Suggested articles</h2>
            <ul className="mt-2 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              {popular.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={helpArticlePath(basePath, article.slug)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 ${helpFocus}`}
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <HelpBackLink href={basePath}>{t('help.backToHelp', 'Back to Help & Support')}</HelpBackLink>
      </div>
    </HelpPageShell>
  );
}
