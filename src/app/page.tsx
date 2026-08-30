import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, CreditCard, Sprout, Wheat } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FarmKeeper — Farm Management Platform',
  description:
    'Modern farm management for livestock, crops, finances, and teams. Sign in or create an account at app.farmkeeper.co.',
  alternates: { canonical: 'https://app.farmkeeper.co/' },
};

const FEATURES = [
  {
    title: 'Livestock & crops',
    body: 'Keep animal and crop records organized with tasks and history in one dashboard.',
    icon: Wheat,
  },
  {
    title: 'Finances & reports',
    body: 'Track income, expenses, feed, eggs, and performance with clear reporting tools.',
    icon: BarChart3,
  },
  {
    title: 'Secure billing',
    body: 'Subscribe with card via Paddle, or Uganda mobile money via Flutterwave.',
    icon: CreditCard,
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_rgba(22,163,74,0.14),_transparent_55%),linear-gradient(180deg,#f0fdf4_0%,#ffffff_42%,#ffffff_100%)] text-gray-900 dark:bg-[radial-gradient(ellipse_at_top,_rgba(22,163,74,0.18),_transparent_50%),linear-gradient(180deg,#030712_0%,#111827_100%)] dark:text-gray-100">
      <header className="sticky top-0 z-20 border-b border-emerald-100/70 bg-white/85 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/85">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="truncate text-base font-bold tracking-tight text-primary-800 dark:text-primary-300 sm:text-lg">
              FarmKeeper
            </span>
          </div>
          <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/en/auth/login"
              className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Sign in
            </Link>
            <Link
              href="/en/auth/register"
              className="inline-flex min-h-10 items-center rounded-xl bg-primary-600 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 active:scale-[0.98]"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-8 sm:px-6 sm:pb-24 sm:pt-16">
        <section className="mx-auto max-w-xl text-center sm:mx-0 sm:max-w-2xl sm:text-left">
          <p className="inline-flex rounded-full bg-primary-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
            Farm management software
          </p>
          <h1 className="mt-4 text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-5xl">
            Run your farm from one secure place
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-lg">
            Track livestock, crops, finances, and daily work in one app. Create an account, choose a plan, and manage
            your farm on phone or desktop.
          </p>

          {/* Desktop / tablet CTAs */}
          <div className="mt-7 hidden gap-3 sm:flex sm:flex-row">
            <Link
              href="/en/auth/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary-600 px-5 text-base font-semibold text-white hover:bg-primary-700"
            >
              Create free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/en/auth/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-5 text-base font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
            >
              Sign in to your farm
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="flex gap-3 rounded-2xl border border-emerald-100/90 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:block sm:p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300 sm:mb-3">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">{item.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.body}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Mobile sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200/90 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 sm:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Link
            href="/en/auth/login"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 active:scale-[0.98] dark:border-gray-700 dark:text-gray-100"
          >
            Sign in
          </Link>
          <Link
            href="/en/auth/register"
            className="inline-flex min-h-12 flex-[1.35] items-center justify-center rounded-xl bg-primary-600 text-sm font-semibold text-white shadow-sm active:scale-[0.98]"
          >
            Create account
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-200 px-4 py-6 dark:border-gray-800 sm:py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <nav className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-600 dark:text-gray-300 sm:flex sm:flex-wrap sm:gap-4">
            <Link href="/en/privacy" className="hover:text-primary-600">
              Privacy Policy
            </Link>
            <Link href="/en/terms" className="hover:text-primary-600">
              Terms &amp; Conditions
            </Link>
            <Link href="/en/refund" className="hover:text-primary-600">
              Refund Policy
            </Link>
            <a href="mailto:info@farmkeeper.co" className="hover:text-primary-600">
              info@farmkeeper.co
            </a>
          </nav>
          <p className="text-xs text-gray-500 sm:text-sm">
            © {new Date().getFullYear()} FarmKeeper. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
