import Link from 'next/link';
import { Sprout } from 'lucide-react';

export default function LegalPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Sprout className="h-4 w-4" />
            </span>
            <span className="truncate text-base font-bold text-primary-700 dark:text-primary-400">FarmKeeper</span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 sm:gap-3 sm:text-sm">
            <Link href="/en/privacy" className="rounded-lg px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              Privacy
            </Link>
            <Link href="/en/terms" className="rounded-lg px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              Terms
            </Link>
            <Link href="/en/refund" className="rounded-lg px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              Refund
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">{description}</p>
        ) : null}
        <article className="mt-6 space-y-7 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 sm:mt-8 sm:space-y-8 [&_a]:font-medium [&_a]:text-primary-700 [&_a]:underline dark:[&_a]:text-primary-400 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 dark:[&_h2]:text-white sm:[&_h2]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
          {children}
        </article>
      </main>

      <footer className="border-t border-gray-200 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] dark:border-gray-800">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 text-sm text-gray-500">
          <nav className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/en/privacy" className="hover:text-primary-600">
              Privacy Policy
            </Link>
            <Link href="/en/terms" className="hover:text-primary-600">
              Terms &amp; Conditions
            </Link>
            <Link href="/en/refund" className="hover:text-primary-600">
              Refund Policy
            </Link>
          </nav>
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} FarmKeeper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
