'use client';

import CropActivityTypeIcon from '@/components/crops/CropActivityTypeIcon';
import { CROP_ACTIVITY_TYPES } from '@/lib/cropActivities';

type CropActivityTypePickerProps = {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
};

export default function CropActivityTypePicker({
  value,
  onChange,
  hasError = false,
}: CropActivityTypePickerProps) {
  return (
    <fieldset id="activityType" className="min-w-0">
      <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 max-md:text-[13px] max-md:font-semibold">
        Activity type
      </legend>
      <div
        className={`mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4 ${
          hasError ? 'rounded-2xl ring-2 ring-red-400 ring-offset-2 dark:ring-offset-gray-800' : ''
        }`}
      >
        {CROP_ACTIVITY_TYPES.map((type) => {
          const selected = value === type.value;
          return (
            <label
              key={type.value}
              className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                selected
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-200'
                  : 'border-gray-300 bg-white text-gray-800 hover:border-emerald-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-emerald-500/60'
              }`}
            >
              <input
                type="radio"
                name="activityType"
                value={type.value}
                checked={selected}
                onChange={() => onChange(type.value)}
                className="sr-only"
              />
              <CropActivityTypeIcon
                type={type.value}
                className={`h-4 w-4 shrink-0 ${
                  selected ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500 dark:text-gray-400'
                }`}
              />
              <span>{type.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
