'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Wheat } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { HARVEST_NOTICE, NoticeBanner, setFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import {
  formatHarvestDate,
  formatProduceAmount,
  harvestCropName,
  harvestFieldLabel,
  type HarvestRecord,
} from '@/lib/harvest';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function HarvestDetailPage({ params }: { params: { farmId: string; harvestId: string } }) {
  const router = useRouter();
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [harvest, setHarvest] = useState<HarvestRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const load = useCallback(async () => {
    const response = await apiClient.getHarvest(farmId, params.harvestId);
    if (!response.success || !response.data) {
      setError(response.error || 'Harvest not found');
      setHarvest(null);
    } else {
      setHarvest(response.data as HarvestRecord);
    }
    setLoading(false);
  }, [farmId, params.harvestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    setIsWorking(true);
    const response = await apiClient.deleteHarvest(farmId, params.harvestId);
    if (!response.success) {
      setError(response.error || 'Failed to delete harvest');
      setIsWorking(false);
      return;
    }
    setFlashNotice(HARVEST_NOTICE.harvestDeleted);
    router.push(farmPath('/dashboard/harvests'));
  };

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />;
  if (error || !harvest) {
    return (
      <div className="max-w-xl md:py-2">
        <NoticeBanner tone="error">{error || 'Harvest not found'}</NoticeBanner>
      </div>
    );
  }

  const cropName = harvestCropName(harvest);

  return (
    <div className="mx-auto max-w-xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
      <Link href={farmPath('/dashboard/harvests')} className="text-sm font-medium text-primary-600">
        ← Back to harvests
      </Link>
      <div className="mt-3 overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl max-md:rounded-2xl max-md:border dark:max-md:border-gray-700/80">
        <div className="border-b border-gray-200 px-4 py-4 md:px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{cropName || 'Harvest'}</p>
              <h1 className="text-2xl font-bold tabular-nums">{formatProduceAmount(harvest.quantity, harvest.unit)}</h1>
              <p className="text-sm text-gray-500">{formatHarvestDate(harvest.harvestDate)}</p>
            </div>
          </div>
        </div>
        <dl className="divide-y divide-gray-100 px-4 py-2 md:px-5">
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Field</dt>
            <dd className="mt-1 text-sm">{harvestFieldLabel(harvest) || 'Not assigned'}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sold</dt>
            <dd className="mt-1 text-sm">{formatProduceAmount(harvest.soldQuantity || 0, harvest.unit)}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Remaining</dt>
            <dd className="mt-1 text-sm font-semibold">
              {formatProduceAmount(harvest.remainingQuantity ?? harvest.quantity, harvest.unit)}
            </dd>
          </div>
          {harvest.notes ? (
            <div className="py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm">{harvest.notes}</dd>
            </div>
          ) : null}
        </dl>
        <div className="flex flex-col gap-2 border-t border-gray-200 p-4 sm:flex-row">
          <Link
            href={farmPath(`/dashboard/harvests/sales/add?cropId=${typeof harvest.cropId === 'object' && harvest.cropId ? harvest.cropId._id : ''}&harvestId=${harvest._id}`)}
            className="btn btn-primary inline-flex min-h-11 flex-1 items-center justify-center"
          >
            Record Sale
          </Link>
          <Link
            href={farmPath(`/dashboard/harvests/${harvest._id}/edit`)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-semibold"
          >
            <Pencil className="h-4 w-4" />
            Edit
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
          title="Delete this harvest?"
          body="This harvest and any sales linked to it will be permanently removed."
          isWorking={isWorking}
          onClose={() => setDeleteOpen(false)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
}
