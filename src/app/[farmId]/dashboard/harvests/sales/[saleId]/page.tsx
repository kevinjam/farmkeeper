'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, ShoppingBag, Trash2 } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { HARVEST_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { formatExpenseAmount } from '@/lib/expenses';
import {
  formatHarvestDate,
  formatProduceAmount,
  harvestCropName,
  harvestIdOf,
  type CropSaleRecord,
} from '@/lib/harvest';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function SaleDetailPage({ params }: { params: { farmId: string; saleId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [sale, setSale] = useState<CropSaleRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const load = useCallback(async () => {
    const response = await apiClient.getCropSale(farmId, params.saleId);
    if (!response.success || !response.data) {
      setError(response.error || 'Sale not found');
    } else {
      setSale(response.data as CropSaleRecord);
    }
    setLoading(false);
  }, [farmId, params.saleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    setIsWorking(true);
    const response = await apiClient.deleteCropSale(farmId, params.saleId);
    if (!response.success) {
      setError(response.error || 'Failed to delete sale');
      setIsWorking(false);
      return;
    }
    setFlashNotice(HARVEST_NOTICE.saleDeleted);
    router.push(farmPath('/dashboard/harvests?tab=sales'));
  };

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />;
  if (error || !sale) return <NoticeBanner tone="error">{error || 'Sale not found'}</NoticeBanner>;

  const harvest = sale.harvestId && typeof sale.harvestId === 'object' ? sale.harvestId : null;

  return (
    <div className="mx-auto max-w-xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <Link href={farmPath('/dashboard/harvests?tab=sales')} className="text-sm font-medium text-primary-600">
        ← Back to sales
      </Link>
      <div className="mt-3 overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 md:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{harvestCropName(sale) || 'Sale'}</p>
              <h1 className="text-2xl font-bold tabular-nums">{formatExpenseAmount(sale.totalAmount, sale.currency)}</h1>
              <p className="text-sm text-gray-500">{formatHarvestDate(sale.saleDate)}</p>
            </div>
          </div>
        </div>
        <dl className="divide-y divide-gray-100 px-4 py-2 md:px-5">
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Quantity</dt>
            <dd className="mt-1 text-sm">{formatProduceAmount(sale.quantity, sale.unit)}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Price per unit</dt>
            <dd className="mt-1 text-sm">
              {formatExpenseAmount(sale.pricePerUnit, sale.currency)}/{sale.unit}
            </dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Buyer</dt>
            <dd className="mt-1 text-sm">{sale.buyerName || 'Not recorded'}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Harvest</dt>
            <dd className="mt-1 text-sm">
              {harvest
                ? `${formatHarvestDate(harvest.harvestDate)} — ${formatProduceAmount(harvest.quantity, harvest.unit)}`
                : harvestIdOf(sale)
                  ? 'Linked harvest'
                  : 'Not linked'}
            </dd>
          </div>
          {sale.notes ? (
            <div className="py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm">{sale.notes}</dd>
            </div>
          ) : null}
        </dl>
        <div className="flex gap-2 border-t border-gray-200 p-4">
          <Link
            href={farmPath(`/dashboard/harvests/sales/${sale._id}/edit`)}
            className="btn btn-primary inline-flex min-h-11 flex-1 items-center justify-center gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            Edit Sale
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
      {deleteOpen ? (
        <ConfirmDeleteDialog
          title="Delete this sale?"
          body="This sale will be permanently removed. Remaining produce will increase."
          isWorking={isWorking}
          onClose={() => setDeleteOpen(false)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
