'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Beef,
  Egg,
  ShoppingBag,
  Sprout,
  Wallet,
  Wheat,
  X,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { buildFarmPath, type AppLocale } from '@/lib/farmPaths';
import { hasFeatureAccess } from '@/lib/features';

type QuickAction = {
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  group: 'crops' | 'animals' | 'money';
};

export default function QuickAddFab({
  farmId,
  locale,
  features,
  unlockAll,
}: {
  farmId: string;
  locale: AppLocale;
  features: string[];
  unlockAll: boolean;
}) {
  const [open, setOpen] = useState(false);
  const can = (feature: string) => hasFeatureAccess(features, feature, unlockAll);

  const actions = useMemo(() => {
    const items: QuickAction[] = [
      {
        label: 'Record harvest',
        hint: 'What you picked from the field',
        href: buildFarmPath(farmId, '/dashboard/harvests/add', locale),
        icon: Wheat,
        group: 'crops',
      },
      {
        label: 'Record crop sale',
        hint: 'Sold produce from a harvest',
        href: buildFarmPath(farmId, '/dashboard/harvests/sales/add', locale),
        icon: ShoppingBag,
        group: 'crops',
      },
      {
        label: 'Add crop',
        hint: 'A new field or planting',
        href: buildFarmPath(farmId, '/dashboard/crops/add', locale),
        icon: Sprout,
        group: 'crops',
      },
    ];
    if (can('livestock')) {
      items.push({
        label: 'Add livestock',
        hint: 'A new animal or flock',
        href: buildFarmPath(farmId, '/dashboard/livestock/add', locale),
        icon: Beef,
        group: 'animals',
      });
    }
    if (can('eggs_sales')) {
      items.push({
        label: 'Record eggs',
        hint: 'Today’s egg collection',
        href: buildFarmPath(farmId, '/dashboard/eggs/record', locale),
        icon: Egg,
        group: 'animals',
      });
    }
    if (can('finances')) {
      items.push({
        label: 'Add expense',
        hint: 'Seeds, labour, feed, and more',
        href: buildFarmPath(farmId, '/dashboard/finances/expense', locale),
        icon: Wallet,
        group: 'money',
      });
    }
    return items;
  }, [farmId, locale, features, unlockAll]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const groups = [
    { id: 'crops', label: 'Crops' },
    { id: 'animals', label: 'Animals' },
    { id: 'money', label: 'Money' },
  ] as const;

  return (
    <div className="md:hidden">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45"
          aria-label="Close add menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {open ? (
        <div
          className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-3 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          role="dialog"
          aria-label="Add to farm"
        >
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-base font-bold text-gray-900 dark:text-white">Add to farm</p>
            <p className="text-xs text-gray-500">Choose what you want to record</p>
          </div>
          <div className="max-h-[min(28rem,70vh)] overflow-y-auto px-2 py-2">
            {groups.map((group) => {
              const rows = actions.filter((item) => item.group === group.id);
              if (!rows.length) return null;
              return (
                <div key={group.id} className="pb-2">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {group.label}
                  </p>
                  {rows.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 active:bg-gray-100 dark:active:bg-gray-800"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900 dark:text-white">{item.label}</span>
                          <span className="block text-xs text-gray-500">{item.hint}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/35 ring-1 ring-white/20 active:scale-95 transition-transform"
        aria-label={open ? 'Close add menu' : 'Add to farm'}
        aria-expanded={open}
      >
        {open ? <X className="h-7 w-7" strokeWidth={2.5} /> : <Plus className="h-7 w-7" strokeWidth={2.5} />}
      </button>
    </div>
  );
}
