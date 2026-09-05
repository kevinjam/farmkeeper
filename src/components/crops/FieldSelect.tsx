'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { cropFormInputClass, type FarmField } from '@/lib/crops';

type FieldSelectProps = {
  farmId: string;
  fields: FarmField[];
  value: string;
  onChange: (fieldId: string) => void;
  onFieldsChange: (fields: FarmField[]) => void;
  id?: string;
  disabled?: boolean;
};

export default function FieldSelect({
  farmId,
  fields,
  value,
  onChange,
  onFieldsChange,
  id = 'fieldId',
  disabled,
}: FieldSelectProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = (next: string) => {
    if (next === '__new__') {
      setCreating(true);
      setError('');
      return;
    }
    setCreating(false);
    onChange(next);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setError('Enter a field or plot name');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const response = await apiClient.createField(farmId, { name });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create field');
      }
      const created = response.data as FarmField;
      const exists = fields.some((field) => field._id === created._id);
      onFieldsChange(exists ? fields : [...fields, created].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(created._id);
      setNewName('');
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create field');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <select
        id={id}
        value={creating ? '__new__' : value}
        disabled={disabled}
        onChange={(e) => handleSelect(e.target.value)}
        className={cropFormInputClass}
      >
        <option value="">Select a field / plot</option>
        {fields.map((field) => (
          <option key={field._id} value={field._id}>
            {field.name}
            {field.area ? ` · ${field.area} ${field.areaUnit || 'acres'}` : ''}
          </option>
        ))}
        <option value="__new__">+ Add new field or plot</option>
      </select>

      {creating ? (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <label htmlFor={`${id}-new`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            New field or plot name
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={`${id}-new`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. North Field"
              className={cropFormInputClass}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleCreate();
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={isSaving}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-50 sm:min-h-11 sm:flex-none"
              >
                {isSaving ? 'Adding…' : 'Add field'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewName('');
                  setError('');
                }}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-100 sm:min-h-11"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
