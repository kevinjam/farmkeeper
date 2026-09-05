'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Package, Pencil, Trash2, Wheat } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { FEED_NOTICE, NoticeBanner, useFlashNotice } from '@/components/NoticeBanner';
import { apiClient } from '@/lib/api';
import { formatStockType, type FeedStock } from '@/lib/feed';
import { useFarmPaths } from '@/hooks/useFarmPaths';

export default function FeedManagementPage({ params }: { params: { farmId: string } }) {
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const { message: notice, clear: clearNotice, setMessage } = useFlashNotice();
  const [feedStock, setFeedStock] = useState<FeedStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFeedStock = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getFeedstock(farmId);

      if (response.success) {
        setFeedStock(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch feedstock');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feedstock');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!farmId) return;
    void fetchFeedStock();
    // Load once per farm; refresh is triggered after writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  const totalStock = feedStock.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = feedStock.filter((item) => item.quantity <= item.minimumThreshold).length;
  const deletingItem = feedStock.find((item) => item._id === deleteId);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const response = await apiClient.deleteFeedstock(farmId, deleteId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete feedstock');
      }
      setDeleteId(null);
      setMessage(FEED_NOTICE.deleted);
      await fetchFeedStock();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:py-2">
        {notice ? (
          <div className="mb-3">
            <NoticeBanner tone="success" onDismiss={clearNotice}>
              {notice}
            </NoticeBanner>
          </div>
        ) : null}

        <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
          <div className="max-md:bg-gradient-to-br max-md:from-orange-400/14 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-orange-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6 md:pb-8">
            <div className="flex max-md:flex-col md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex max-md:items-start max-md:gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-400/20 text-orange-900 dark:bg-orange-500/18 dark:text-orange-200 md:hidden">
                  <Wheat className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">Feed management</h1>
                  <p className="mt-0.5 text-[13px] leading-snug text-gray-600 dark:text-gray-300 md:mt-1 md:text-lg md:text-gray-500">
                    Monitor and manage your farm&apos;s feed inventory and usage.
                  </p>
                </div>
              </div>
              <Link
                href={farmPath('/dashboard/feed/add')}
                className="btn btn-primary mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 max-md:min-h-12 max-md:rounded-xl md:mt-0 md:w-auto"
              >
                + Add feed stock
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40 md:rounded-lg">
            <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 px-3 md:hidden">
          <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-orange-400/35 bg-gradient-to-br from-orange-400/12 via-white to-white p-3 shadow-md dark:from-orange-500/14 dark:via-gray-900 dark:to-gray-900/95 dark:border-orange-500/25">
            <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-orange-500/50 opacity-90" />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">In stock</p>
            <p className="mt-1 text-[1.2rem] font-extrabold tabular-nums text-orange-950 dark:text-orange-100">
              {isLoading ? '—' : `${totalStock} kg`}
            </p>
            <p className="mt-auto text-[10px] font-medium text-gray-500 dark:text-gray-400">Quantity sum</p>
          </div>
          <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-white to-white p-3 shadow-md dark:from-sky-500/14 dark:via-gray-900 dark:to-gray-900/95 dark:border-sky-500/25">
            <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-sky-500/45 opacity-90" />
            <div className="flex items-start justify-between gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Types</p>
              <Package className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="mt-1 text-[1.35rem] font-extrabold tabular-nums text-sky-900 dark:text-sky-100">
              {isLoading ? '—' : feedStock.length}
            </p>
            <p className="mt-auto text-[10px] font-medium text-gray-500 dark:text-gray-400">SKUs tracked</p>
          </div>
          <div className="relative col-span-2 flex min-h-[5.5rem] flex-col rounded-xl border border-red-500/25 bg-gradient-to-br from-red-500/10 via-white to-white p-3 shadow-md dark:from-red-500/14 dark:via-gray-900 dark:to-gray-900/95 dark:border-red-500/20">
            <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-red-500/40 opacity-90" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Low stock
              </p>
            </div>
            <p className="mt-1 text-[1.35rem] font-extrabold tabular-nums text-red-700 dark:text-red-300">
              {isLoading ? '—' : `${lowStockCount} items`}
            </p>
          </div>
        </div>

        <div className="mt-4 hidden gap-6 md:grid md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Feed in Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStock} kg</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Feed Types</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{feedStock.length} types</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockCount} items</p>
          </div>
        </div>

        <div className="mt-4 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white max-md:shadow-md dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800 md:mt-8 md:rounded-lg md:bg-white md:shadow dark:md:bg-gray-800">
          <div className="p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">Current inventory</h2>

            <div className="mt-4 space-y-3 md:hidden">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading feed stock...</p>
              ) : feedStock.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                  No feed records. Tap &quot;Add feed stock&quot; to get started.
                </p>
              ) : (
                feedStock.map((item) => (
                  <div
                    key={item._id}
                    className={`rounded-2xl border p-4 shadow-sm ${
                      item.quantity <= item.minimumThreshold
                        ? 'border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/30'
                        : 'border-gray-200/90 bg-white dark:border-gray-700 dark:bg-gray-800/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{formatStockType(item.stockType)}</p>
                      </div>
                      {item.quantity <= item.minimumThreshold && (
                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                          Low stock
                        </span>
                      )}
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div>
                        <dt className="font-medium text-gray-500">Quantity</dt>
                        <dd className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                          {item.quantity} {item.unit}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Supplier</dt>
                        <dd className="mt-0.5">{item.supplier || 'N/A'}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="font-medium text-gray-500">Purchased</dt>
                        <dd className="mt-0.5">{formatDate(item.purchaseDate)}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                      <Link
                        href={farmPath(`/dashboard/feed/${item._id}/edit`)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(item._id)}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Feed Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Purchase Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        Loading feed stock...
                      </td>
                    </tr>
                  ) : feedStock.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No feed records available. Click &quot;Add Feed Stock&quot; to get started.
                      </td>
                    </tr>
                  ) : (
                    feedStock.map((item) => (
                      <tr
                        key={item._id}
                        className={item.quantity <= item.minimumThreshold ? 'bg-red-50 dark:bg-red-900/20' : ''}
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {formatStockType(item.stockType)}
                          {item.quantity <= item.minimumThreshold && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{item.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {item.supplier || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {formatDate(item.purchaseDate)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <Link
                            href={farmPath(`/dashboard/feed/${item._id}/edit`)}
                            className="mr-4 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteId(item._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {deleteId ? (
        <ConfirmDeleteDialog
          title={`Delete ${deletingItem?.name || 'feed stock'}?`}
          body="This cannot be undone. The inventory record will be removed from your farm."
          isWorking={isDeleting}
          onClose={() => setDeleteId(null)}
          onDelete={() => void handleDelete()}
        />
      ) : null}
    </>
  );
}
