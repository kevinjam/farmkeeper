'use client';

import Link from 'next/link';
import { CircleHelp } from 'lucide-react';
import { helpFocus } from './HelpPageShell';

export default function HelpHint({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className={`mt-1.5 inline-flex max-w-full items-start gap-1.5 text-[13px] font-medium leading-snug text-primary-700 hover:underline dark:text-primary-300 ${helpFocus}`}
    >
      <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </Link>
  );
}
