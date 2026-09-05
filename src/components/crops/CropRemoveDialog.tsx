'use client';

import { useEffect, useState } from 'react';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';

type CropRemoveDialogProps = {
  cropName: string;
  archived?: boolean;
  isWorking: boolean;
  onClose: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete: () => void;
};

export default function CropRemoveDialog({
  cropName,
  archived = false,
  isWorking,
  onClose,
  onArchive,
  onRestore,
  onDelete,
}: CropRemoveDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [cropName, archived]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-crop-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 dark:bg-black/60"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-t-3xl border border-gray-200 bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl md:pb-6">
        {confirmDelete ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/70">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
            </div>
            <h3 id="remove-crop-title" className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
              Delete “{cropName}”?
            </h3>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              This cannot be undone. The crop record will be removed from your farm.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={onDelete}
                disabled={isWorking}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50 dark:bg-red-500"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                {isWorking ? 'Deleting…' : 'Delete permanently'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={isWorking}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                Back
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                archived
                  ? 'bg-emerald-100 dark:bg-emerald-900/70'
                  : 'bg-amber-100 dark:bg-amber-900/70'
              }`}
            >
              {archived ? (
                <RotateCcw className="h-6 w-6 text-emerald-700 dark:text-emerald-300" strokeWidth={2} />
              ) : (
                <Archive className="h-6 w-6 text-amber-700 dark:text-amber-300" strokeWidth={2} />
              )}
            </div>
            <h3 id="remove-crop-title" className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
              {archived ? `Restore “${cropName}”?` : `Archive “${cropName}”?`}
            </h3>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {archived
                ? 'Restore this crop to your active list, or delete it permanently.'
                : 'Archiving hides it from your active crop list. You can restore it later.'}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {archived ? (
                <button
                  type="button"
                  onClick={onRestore}
                  disabled={isWorking}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2} />
                  {isWorking ? 'Working…' : 'Restore crop'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onArchive}
                  disabled={isWorking}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Archive className="h-4 w-4" strokeWidth={2} />
                  {isWorking ? 'Working…' : 'Archive crop'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={isWorking}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 disabled:opacity-50 dark:border-red-900/50 dark:bg-gray-800 dark:text-red-300"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                Delete permanently
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
          </>
        )}
      </div>
    </div>
  );
}
