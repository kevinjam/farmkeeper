'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { getHelpCategory, type HelpArticle } from '@/lib/help';
import HelpSupportCta from './HelpSupportCta';
import { HelpBackLink, HelpPageShell, helpFocus } from './HelpPageShell';

export default function HelpArticleView({
  article,
  basePath,
}: {
  article: HelpArticle;
  basePath: string;
}) {
  const { t } = useTranslations('common');
  const category = getHelpCategory(article.categoryId);
  const categoryHref = category ? `${basePath}?section=learn&category=${category.id}` : `${basePath}?section=learn`;

  return (
    <HelpPageShell
      icon={<BookOpen className="h-6 w-6" strokeWidth={2} />}
      title={article.title}
      subtitle={article.description}
      crumbs={[
        { href: basePath, label: 'Help' },
        { href: `${basePath}?section=learn`, label: 'Learn' },
        ...(category ? [{ href: categoryHref, label: category.label }] : []),
        { href: `${basePath}/articles/${article.slug}`, label: article.title },
      ]}
    >
      <div className="space-y-6">
        {category ? (
          <Link
            href={categoryHref}
            className={`inline-flex rounded-full bg-sky-50 px-3 py-1 text-[13px] font-semibold text-sky-800 dark:bg-sky-950/40 dark:text-sky-200 ${helpFocus}`}
          >
            {category.label}
          </Link>
        ) : null}

        {article.steps?.length ? (
          <ol className="space-y-2.5">
            {article.steps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm leading-relaxed text-gray-800 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {article.notes?.length ? (
          <div className="space-y-3 rounded-2xl border border-gray-200 px-4 py-4 dark:border-gray-700">
            {article.notes.map((note) => (
              <p key={note} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {note}
              </p>
            ))}
          </div>
        ) : null}

        <HelpSupportCta helpBasePath={basePath} />
        <HelpBackLink href={categoryHref}>{t('help.backToTopics', 'Back to topics')}</HelpBackLink>
      </div>
    </HelpPageShell>
  );
}
