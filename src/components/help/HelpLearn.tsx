'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import {
  HELP_CATEGORIES,
  articlesForCategory,
  getHelpCategory,
  helpArticlePath,
} from '@/lib/help';
import { HelpBackLink, HelpPageShell, helpFocus } from './HelpPageShell';

export default function HelpLearn({ basePath }: { basePath: string }) {
  const { t } = useTranslations('common');
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const category = getHelpCategory(categoryId);
  const articles = category ? articlesForCategory(category.id) : [];
  const visibleCategories = HELP_CATEGORIES.filter((item) => articlesForCategory(item.id).length > 0);

  if (category && articles.length > 0) {
    return (
      <HelpPageShell
        icon={<BookOpen className="h-6 w-6" strokeWidth={2} />}
        title={category.label}
        subtitle={category.description}
        crumbs={[
          { href: basePath, label: 'Help' },
          { href: `${basePath}?section=learn`, label: 'Learn' },
          { href: `${basePath}?section=learn&category=${category.id}`, label: category.label },
        ]}
      >
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={helpArticlePath(basePath, article.slug)}
                className={`flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/80 ${helpFocus}`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">{article.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-gray-500 dark:text-gray-400">
                    {article.description}
                  </span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <HelpBackLink href={`${basePath}?section=learn`}>{t('help.backToTopics', 'Back to topics')}</HelpBackLink>
        </div>
      </HelpPageShell>
    );
  }

  return (
    <HelpPageShell
      icon={<BookOpen className="h-6 w-6" strokeWidth={2} />}
      title={t('help.learnTitle', 'Learn FarmKeeper')}
      subtitle={t('help.browseCategories', 'Browse short guides by topic.')}
      crumbs={[
        { href: basePath, label: 'Help' },
        { href: `${basePath}?section=learn`, label: 'Learn' },
      ]}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {visibleCategories.map((item) => {
          const count = articlesForCategory(item.id).length;
          return (
            <Link
              key={item.id}
              href={`${basePath}?section=learn&category=${item.id}`}
              className={`flex min-h-[6rem] flex-col rounded-2xl border border-gray-200 bg-gray-50/60 p-4 transition hover:border-primary-200 hover:bg-white dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-primary-900/60 dark:hover:bg-gray-900 ${helpFocus}`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</span>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              </span>
              <span className="mt-1 text-[13px] leading-snug text-gray-500 dark:text-gray-400">{item.description}</span>
              <span className="mt-auto pt-3 text-xs font-medium text-gray-400">
                {count} {count === 1 ? 'article' : 'articles'}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-5">
        <HelpBackLink href={basePath}>{t('help.backToHelp', 'Back to Help & Support')}</HelpBackLink>
      </div>
    </HelpPageShell>
  );
}
