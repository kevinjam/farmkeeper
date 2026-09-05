'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LifeBuoy } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { helpFocus } from './HelpPageShell';

export default function HelpSupportCta({
  helpBasePath,
  heading = true,
}: {
  helpBasePath: string;
  heading?: boolean;
}) {
  const { t } = useTranslations('common');
  const pathname = usePathname();
  const from = pathname ? `&from=${encodeURIComponent(pathname)}` : '';

  return (
    <div className="rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-4 dark:border-sky-900/50 dark:bg-sky-950/30">
      {heading ? (
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('help.stillNeedHelp', 'Still need help?')}
        </p>
      ) : null}
      <p className={`${heading ? 'mt-1' : ''} text-sm text-gray-600 dark:text-gray-300`}>
        Send a request and we will review it from your farm.
      </p>
      <Link
        href={`${helpBasePath}?section=support${from}`}
        className={`btn btn-primary mt-3 inline-flex min-h-11 items-center justify-center gap-2 ${helpFocus}`}
      >
        <LifeBuoy className="h-4 w-4" aria-hidden />
        {t('help.contactSupport', 'Contact FarmKeeper Support')}
      </Link>
    </div>
  );
}
