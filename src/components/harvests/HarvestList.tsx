'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { HARVEST_NOTICE, NoticeBanner } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  formatHarvestDate,
  formatProduceAmount,
  harvestCropName,
  harvestFieldLabel,
  type HarvestRecord,
} from '@/lib/harvest';

export default function HarvestList({
  farmId,
  cropId,
  onChanged,
}: {
  farmId: string;
  cropId?: string;
  onChanged?: () => void;
}) {
  const { farmPath } = useFarmPaths(farmId);
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<HarvestRecord | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await apiClient.getHarvests(farmId, cropId);
    if (!response.success) {
      setError(response.error || 'Failed to load harvests');
      setRecords([]);
    } else {
      setError('');
      setRecords((response.data || []) as HarvestRecord[]);
    }
    setLoading(false);
  }, [farmId, cropId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!pending) return;
    setIsWorking(true);
    const response = await apiClient.deleteHarvest(farmId, pending._id);
    if (!response.success) {
      setError(response.error || 'Failed to delete harvest');
      setIsWorking(false);
      return;
    }
    setNotice(HARVEST_NOTICE.harvestDeleted);
    setPending(null);
    setIsWorking(false);
    void load();
    onChanged?.();
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {notice ? (
        <div className="mb-3">
          <NoticeBanner tone="success" onDismiss={() => setNotice('')}>
            {notice}
          </NoticeBanner>
        </div>
      ) : null}
      {error ? (
        <div className="mb-3">
          <NoticeBanner tone="error" onDismiss={() => setError('')}>
            {error}
          </NoticeBanner>
        </div>
      ) : null}
      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center dark:border-gray-600">
          <p className="text-2xl" aria-hidden>
            🌾
          </p>
          <p className="mt-2 font-semibold text-gray-900 dark:text-white">No harvests yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Record your first harvest to track what you produced.
          </p>
          <Link
            href={farmPath(cropId ? `/dashboard/harvests/add?cropId=${cropId}` : '/dashboard/harvests/add')}
            className="btn btn-primary mt-4 inline-flex min-h-11 items-center justify-center"
          >
            Record Harvest
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-100 lg:hidden dark:divide-gray-700/80">
            {records.map((item) => (
              <li key={item._id} className="py-3">
                <p className="text-xs font-medium text-gray-500">{formatHarvestDate(item.harvestDate)}</p>
                <p className="mt-0.5 text-sm font-semibold">{harvestCropName(item) || 'Crop'}</p>
                <p className="text-xs text-gray-500">{harvestFieldLabel(item) || 'No field'}</p>
                <p className="mt-1 text-sm tabular-nums">
                  {formatProduceAmount(item.quantity, item.unit)} · sold {formatProduceAmount(item.soldQuantity || 0, item.unit)} ·{' '}
                  {formatProduceAmount(item.remainingQuantity ?? item.quantity, item.unit)} left
                </p>
                <div className="mt-2 flex gap-2">
                  <Link href={farmPath(`/dashboard/harvests/${item._id}`)} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold">
                    View
                  </Link>
                  <Link href={farmPath(`/dashboard/harvests/${item._id}/edit`)} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold">
                    Edit
                  </Link>
                  <button type="button" onClick={() => setPending(item)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Date', 'Crop', 'Field', 'Harvested', 'Sold', 'Remaining', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((item) => (
                  <tr key={item._id}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm">{formatHarvestDate(item.harvestDate)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm">{harvestCropName(item)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm text-gray-600">{harvestFieldLabel(item) || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm tabular-nums">{formatProduceAmount(item.quantity, item.unit)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm tabular-nums">{formatProduceAmount(item.soldQuantity || 0, item.unit)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold tabular-nums">
                      {formatProduceAmount(item.remainingQuantity ?? item.quantity, item.unit)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <div className="inline-flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-600">
                        <Link href={farmPath(`/dashboard/harvests/${item._id}`)} className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        <Link href={farmPath(`/dashboard/harvests/${item._id}/edit`)} className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button type="button" onClick={() => setPending(item)} className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {pending ? (
        <ConfirmDeleteDialog
          title="Delete this harvest?"
          body="This harvest and any sales linked to it will be permanently removed."
          isWorking={isWorking}
          onClose={() => setPending(null)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
