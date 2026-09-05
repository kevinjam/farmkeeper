'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, ChevronRight, CircleHelp, LifeBuoy, Search } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import {
  HELP_CATEGORIES,
  articlesForCategory,
  getHelpCategory,
  helpArticlePath,
  popularHelpArticles,
  searchHelpArticles,
} from '@/lib/help';
import HelpLearn from './HelpLearn';
import HelpSearch from './HelpSearch';
import HelpSupport from './HelpSupport';
import { helpFocus } from './HelpPageShell';

const SECTIONS = ['search', 'support', 'learn'] as const;
export type HelpSection = (typeof SECTIONS)[number];

export function isHelpSection(value: string | null): value is HelpSection {
  return value === 'search' || value === 'support' || value === 'learn';
}

export default function HelpLanding({
  basePath,
  missing = false,
}: {
  basePath: string;
  missing?: boolean;
}) {
  const { t } = useTranslations('common');
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const unknownSection = Boolean(section) && !isHelpSection(section);
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const results = useMemo(() => (trimmed ? searchHelpArticles(trimmed) : []), [trimmed]);
  const popular = popularHelpArticles();
  const topics = HELP_CATEGORIES.filter((item) => articlesForCategory(item.id).length > 0).slice(0, 8);

  if (section === 'search') {
    return <HelpSearch basePath={basePath} />;
  }
  if (section === 'learn') {
    return <HelpLearn basePath={basePath} />;
  }
  if (section === 'support') {
    return <HelpSupport basePath={basePath} />;
  }

  const cards = [
    {
      id: 'search',
      href: `${basePath}?section=search`,
      icon: Search,
      title: t('help.searchTitle', 'Search Help'),
      body: t('help.searchCard', 'Find answers to common questions.'),
      tone: 'bg-sky-500/12 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
    },
    {
      id: 'support',
      href: `${basePath}?section=support`,
      icon: LifeBuoy,
      title: t('help.supportTitle', 'Get Support'),
      body: t('help.supportCard', "Something isn't working? Contact FarmKeeper."),
      tone: 'bg-amber-500/12 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
    },
    {
      id: 'learn',
      href: `${basePath}?section=learn`,
      icon: BookOpen,
      title: t('help.learnTitle', 'Learn FarmKeeper'),
      body: t('help.learnCard', 'Quick guides for using FarmKeeper.'),
      tone: 'bg-emerald-500/12 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
    },
  ] as const;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <section className="shrink-0 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-800">
        <div className="bg-gradient-to-br from-sky-50 via-white to-emerald-50/50 px-4 py-4 dark:from-sky-950/40 dark:via-gray-800 dark:to-gray-800 md:px-5">
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700 shadow-sm dark:bg-sky-500/20 dark:text-sky-300"
              aria-hidden
            >
              <CircleHelp className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                Help Center
              </p>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-gray-900 dark:text-white md:text-2xl">
                How can we help?
              </h1>
              <p className="mt-1 text-sm leading-snug text-gray-600 dark:text-gray-300">
                {t(
                  'help.subtitle',
                  'Search guides, learn FarmKeeper, or send a request if something is not working.'
                )}
              </p>
            </div>
          </div>

          {missing || unknownSection ? (
            <p
              role="status"
              className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
            >
              {t('help.missingPage', "We couldn't find that help page. Choose an option below.")}
            </p>
          ) : null}

          <label className="relative mt-4 block">
            <span className="sr-only">{t('help.searchPlaceholder', 'Search FarmKeeper Help')}</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('help.searchPlaceholder', 'Search for crops, harvests, sales, or billing')}
              autoComplete="off"
              className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white [font-size:16px]"
            />
          </label>
        </div>
      </section>

      {trimmed ? (
        <section className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-gray-200/90 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-800">
          {results.length > 0 ? (
            <ul aria-live="polite">
              {results.map((article) => (
                <li key={article.slug} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <Link
                    href={helpArticlePath(basePath, article.slug)}
                    className={`flex items-start justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 ${helpFocus}`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">{article.title}</span>
                      <span className="mt-0.5 block text-[13px] text-gray-500">
                        {getHelpCategory(article.categoryId)?.label || 'Help'} · {article.description}
                      </span>
                    </span>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div role="status" className="px-4 py-5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('help.noAnswer', "We couldn't find an answer.")}
              </p>
              <Link
                href={`${basePath}?section=support`}
                className={`mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary-700 dark:text-primary-300 ${helpFocus}`}
              >
                Contact FarmKeeper Support
              </Link>
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="grid shrink-0 gap-3 md:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className={`group flex items-center gap-3 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800 dark:hover:border-primary-900/50 ${helpFocus}`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.tone}`} aria-hidden>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{card.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-gray-500 dark:text-gray-400">
                      {card.body}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" aria-hidden />
                </Link>
              );
            })}
          </div>

          <div className="grid min-h-0 flex-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,1fr)]">
            <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-800">
              <div className="flex shrink-0 items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Popular articles</h2>
                  <p className="mt-0.5 text-sm text-gray-500">Start with the guides farmers use most.</p>
                </div>
                <Link
                  href={`${basePath}?section=learn`}
                  className={`hidden text-sm font-semibold text-primary-700 dark:text-primary-300 sm:inline-flex ${helpFocus}`}
                >
                  Browse all
                </Link>
              </div>
              <ul className="mt-3 min-h-0 flex-1 overflow-y-auto">
                {popular.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={helpArticlePath(basePath, article.slug)}
                      className={`flex min-h-12 items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 ${helpFocus}`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">{article.title}</span>
                        <span className="mt-0.5 block truncate text-[13px] text-gray-500">{article.description}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm dark:border-gray-700/80 dark:bg-gray-800">
              <h2 className="shrink-0 text-base font-bold text-gray-900 dark:text-white">Browse by topic</h2>
              <div className="mt-3 flex min-h-0 flex-wrap content-start gap-2 overflow-y-auto">
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`${basePath}?section=learn&category=${topic.id}`}
                    className={`inline-flex min-h-10 items-center rounded-full border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:border-primary-200 hover:bg-primary-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-900 ${helpFocus}`}
                  >
                    {topic.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
