'use client';

import HelpArticleView from './HelpArticleView';
import HelpLanding from './HelpLanding';
import { getHelpArticle } from '@/lib/help';

export default function HelpArticlePage({
  basePath,
  slug,
}: {
  basePath: string;
  slug: string;
}) {
  const article = getHelpArticle(slug);
  if (!article) {
    return <HelpLanding basePath={basePath} missing />;
  }
  return <HelpArticleView article={article} basePath={basePath} />;
}
