'use client';

import { Trash2 } from 'lucide-react';

type CropActivityDeleteDialogProps = {
  isWorking: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export default function CropActivityDeleteDialog({
  isWorking,
  onClose,
  onDelete,
}: CropActivityDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-activity-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 dark:bg-black/60"
        aria-label="Dismiss"
        onClick={onClose}
        disabled={isWorking}
      />
      <div className="relative w-full max-w-md rounded-t-3xl border border-gray-200 bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl md:pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/70">
          <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
        </div>
        <h3 id="delete-activity-title" className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
          Delete this activity?
        </h3>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          This activity will be permanently removed.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={isWorking}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50 dark:bg-red-500"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            {isWorking ? 'Deleting…' : 'Delete'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
