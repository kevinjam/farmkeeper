'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
  className?: string;
};

export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  labelledBy = 'bottom-sheet-title',
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 dark:bg-black/60"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-xl dark:bg-gray-900 sm:rounded-2xl',
          className
        )}
      >
        <div className="flex justify-center pt-2 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="flex items-start justify-between px-5 pb-3 pt-2 sm:border-b sm:border-gray-200 sm:px-5 sm:py-4 dark:sm:border-gray-700">
          <div className="min-w-0 pr-3">
            <h3 id={labelledBy} className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer ? <div className="mt-auto">{footer}</div> : null}
      </div>
    </div>
  );
}
