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
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/en/auth/login" className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-primary-700 dark:text-primary-400">FarmKeeper</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/en/privacy" className="hover:text-primary-600">
              Privacy
            </Link>
            <Link href="/en/terms" className="hover:text-primary-600">
              Terms
            </Link>
            <Link href="/en/refund" className="hover:text-primary-600">
              Refund
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
        ) : null}
        <article className="mt-8 space-y-8 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&_a]:font-medium [&_a]:text-primary-700 [&_a]:underline dark:[&_a]:text-primary-400 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
          {children}
        </article>
      </main>

      <footer className="border-t border-gray-200 px-4 py-6 dark:border-gray-800">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-4">
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
          <p>© {new Date().getFullYear()} FarmKeeper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
