'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LifeBuoy } from 'lucide-react';
import { getLocaleFromPathname } from '@/lib/farmPaths';
import { HelpPageShell, helpFocus } from '@/components/help/HelpPageShell';

function PublicHelpTicketContent({ ticketNumber }: { ticketNumber: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const locale = getLocaleFromPathname(pathname);

  useEffect(() => {
    const farmSlug = localStorage.getItem('farmSlug') || '';
    const hasSession = Boolean(
      localStorage.getItem('auth-token') || document.cookie.split(';').some((part) => part.trim().startsWith('token='))
    );
    const safeSlug = /^[a-z0-9-]{3,50}$/i.test(farmSlug) ? farmSlug : '';

    if (hasSession && safeSlug) {
      router.replace(`/${locale}/${safeSlug}/dashboard/help/tickets/${ticketNumber}`);
      return;
    }
    setReady(true);
  }, [locale, router, ticketNumber]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-gray-500">
        Opening support request…
      </div>
    );
  }

  return (
    <HelpPageShell
      icon={<LifeBuoy className="h-6 w-6" />}
      title="Support request"
      subtitle="Sign in to view your ticket and replies."
      crumbs={[{ href: `/${locale}/help`, label: 'Help' }]}
    >
      <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tickets stay on your farm. Sign in to open {ticketNumber || 'your request'}.
        </p>
        <Link
          href={`/${locale}/auth/login`}
          className={`btn btn-primary mt-4 inline-flex min-h-11 items-center justify-center ${helpFocus}`}
        >
          Sign in
        </Link>
      </div>
    </HelpPageShell>
  );
}

export default function PublicHelpTicketPage({ params }: { params: { ticketNumber: string } }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-gray-500">
          Opening support request…
        </div>
      }
    >
      <PublicHelpTicketContent ticketNumber={params.ticketNumber} />
    </Suspense>
  );
}
