'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const helpFocus =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900';

export const helpFieldClass =
  'block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:border-gray-600 dark:bg-gray-900 dark:text-white md:text-sm [font-size:16px]';

export function helpStatusClass(status: string) {
  if (status === 'IN_PROGRESS') return 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-200';
  if (status === 'RESOLVED') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200';
  if (status === 'CLOSED') return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
}

export function HelpRouteFrame({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>;
}

export function HelpBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white ${helpFocus}`}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}

export function HelpPageShell({
  icon,
  title,
  subtitle,
  children,
  crumbs,
  actions,
  scrollBody = true,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  crumbs?: { href: string; label: string }[];
  actions?: ReactNode;
  scrollBody?: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="shrink-0 border-b border-gray-200/80 bg-gradient-to-br from-sky-50/90 via-white to-emerald-50/40 px-4 py-4 dark:border-gray-700 dark:from-sky-950/35 dark:via-gray-800 dark:to-gray-800 md:px-5">
        {crumbs?.length ? (
          <nav aria-label="Help breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.href}-${crumb.label}`} className="inline-flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden>/</span> : null}
                <Link href={crumb.href} className={`hover:text-gray-800 dark:hover:text-gray-200 ${helpFocus}`}>
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700 shadow-sm dark:bg-sky-500/20 dark:text-sky-300"
              aria-hidden
            >
              {icon}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white md:text-2xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
      {children ? (
        <div className={`min-h-0 flex-1 p-4 md:p-5 ${scrollBody ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
