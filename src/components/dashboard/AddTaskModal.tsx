'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { TASK_PRESETS, TaskPriority } from '@/lib/tasks';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  onSuccess: () => void;
}

export default function AddTaskModal({ isOpen, onClose, farmId, onSuccess }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setPriority('medium');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const applyPreset = (preset: (typeof TASK_PRESETS)[number]) => {
    setTitle(preset.title);
    setDescription(preset.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give your task a short name — e.g. "Feed chickens".');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiClient.createTask(farmId, {
        title: title.trim(),
        description: description.trim() || title.trim(),
        dueDate: new Date(`${dueDate}T12:00:00`).toISOString(),
        priority,
      });

      if (!response.success) {
        throw new Error(response.error || 'Could not save task');
      }

      handleClose();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save task. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-gray-900 sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add farm task</h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Plan feeding, health checks, and daily chores
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="space-y-4 px-5 py-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <Label className="mb-2 block text-sm font-medium">Quick picks</Label>
              <div className="flex flex-wrap gap-2">
                {TASK_PRESETS.map((preset) => {
                  const selected = title === preset.title;
                  return (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition ${
                        selected
                          ? 'border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-600'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-primary-500 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {preset.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="task-title">What needs doing?</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Feed layer chickens"
                className="mt-1.5 h-11"
              />
            </div>

            <div>
              <Label htmlFor="task-notes">Notes (optional)</Label>
              <textarea
                id="task-notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Any details for you or farm workers"
                className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label>Priority</Label>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold capitalize transition ${
                        priority === p
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {p === 'high' ? 'Urgent' : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-700">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save task'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
