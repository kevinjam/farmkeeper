'use client';

import { Suspense } from 'react';
import HelpArticlePage from '@/components/help/HelpArticlePage';
import { HelpRouteFrame } from '@/components/help/HelpPageShell';
import { useFarmPaths } from '@/hooks/useFarmPaths';

function FarmHelpArticleContent({ slug }: { slug: string }) {
  const { farmPath } = useFarmPaths();
  return <HelpArticlePage basePath={farmPath('/dashboard/help')} slug={slug} />;
}

export default function FarmHelpArticleRoute({ params }: { params: { slug: string } }) {
  return (
    <HelpRouteFrame>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        }
      >
        <FarmHelpArticleContent slug={params.slug} />
      </Suspense>
    </HelpRouteFrame>
  );
}
