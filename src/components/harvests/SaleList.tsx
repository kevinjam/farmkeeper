'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { HARVEST_NOTICE, NoticeBanner } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import { formatExpenseAmount } from '@/lib/expenses';
import {
  formatHarvestDate,
  formatProduceAmount,
  harvestCropName,
  type CropSaleRecord,
} from '@/lib/harvest';

function saleHarvestSource(item: CropSaleRecord) {
  const harvest = item.harvestId;
  if (!harvest) return 'Unlinked';
  if (typeof harvest === 'string') return 'Linked harvest';
  return `${formatHarvestDate(harvest.harvestDate)} · ${formatProduceAmount(harvest.quantity, harvest.unit)}`;
}

export default function SaleList({
  farmId,
  cropId,
  onChanged,
}: {
  farmId: string;
  cropId?: string;
  onChanged?: () => void;
}) {
  const { farmPath } = useFarmPaths(farmId);
  const [records, setRecords] = useState<CropSaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<CropSaleRecord | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await apiClient.getCropSales(farmId, cropId ? { cropId } : undefined);
    if (!response.success) {
      setError(response.error || 'Failed to load sales');
      setRecords([]);
    } else {
      setError('');
      setRecords((response.data || []) as CropSaleRecord[]);
    }
    setLoading(false);
  }, [farmId, cropId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    if (!pending) return;
    setIsWorking(true);
    const response = await apiClient.deleteCropSale(farmId, pending._id);
    if (!response.success) {
      setError(response.error || 'Failed to delete sale');
      setIsWorking(false);
      return;
    }
    setNotice(HARVEST_NOTICE.saleDeleted);
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
            💰
          </p>
          <p className="mt-2 font-semibold text-gray-900 dark:text-white">No sales recorded yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Record a sale when you sell harvested produce still on the farm.
          </p>
          <Link
            href={farmPath(cropId ? `/dashboard/harvests/sales/add?cropId=${cropId}` : '/dashboard/harvests/sales/add')}
            className="btn btn-primary mt-4 inline-flex min-h-11 items-center justify-center"
          >
            Record Sale
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-100 lg:hidden dark:divide-gray-700/80">
            {records.map((item) => (
              <li key={item._id} className="py-3">
                <p className="text-xs font-medium text-gray-500">{formatHarvestDate(item.saleDate)}</p>
                <p className="mt-0.5 text-sm font-semibold">{harvestCropName(item) || 'Crop'}</p>
                <p className="text-sm tabular-nums">
                  {formatProduceAmount(item.quantity, item.unit)} · {formatExpenseAmount(item.pricePerUnit, item.currency)}/{item.unit}
                </p>
                <p className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {formatExpenseAmount(item.totalAmount, item.currency)}
                </p>
                <p className="text-xs text-gray-500">{item.buyerName || 'No buyer recorded'}</p>
                <p className="text-xs text-gray-500">{saleHarvestSource(item)}</p>
                <div className="mt-2 flex gap-2">
                  <Link href={farmPath(`/dashboard/harvests/sales/${item._id}`)} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold">
                    View
                  </Link>
                  <Link href={farmPath(`/dashboard/harvests/sales/${item._id}/edit`)} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold">
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
                  {['Date', 'Crop', 'Quantity', 'Price/unit', 'Total', 'Buyer', 'Harvest', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((item) => (
                  <tr key={item._id}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm">{formatHarvestDate(item.saleDate)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm">{harvestCropName(item)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm tabular-nums">{formatProduceAmount(item.quantity, item.unit)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm tabular-nums">
                      {formatExpenseAmount(item.pricePerUnit, item.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm font-semibold tabular-nums text-emerald-700">
                      {formatExpenseAmount(item.totalAmount, item.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm">{item.buyerName || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm text-gray-600">
                      {saleHarvestSource(item)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <div className="inline-flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-600">
                        <Link href={farmPath(`/dashboard/harvests/sales/${item._id}`)} className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        <Link href={farmPath(`/dashboard/harvests/sales/${item._id}/edit`)} className="inline-flex h-8 items-center gap-1 px-2 text-xs font-semibold">
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
          title="Delete this sale?"
          body="This sale will be permanently removed. Remaining produce will increase."
          isWorking={isWorking}
          onClose={() => setPending(null)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
