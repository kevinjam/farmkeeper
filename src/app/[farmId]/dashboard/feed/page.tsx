'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Package, Pencil, Trash2, Wheat } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface FeedStock {
  _id: string;
  stockType: string;
  name: string;
  quantity: number;
  unit: string;
  minimumThreshold: number;
  supplier?: string;
  purchaseDate: string;
  expiryDate?: string;
  costPerUnit?: number;
  totalCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeedFormData {
  stockType: string;
  name: string;
  quantity: number;
  unit: string;
  minimumThreshold: number;
  supplier?: string;
  purchaseDate: string;
  expiryDate?: string;
  costPerUnit?: number;
  totalCost?: number;
  notes?: string;
}

const STOCK_TYPES = [
  { value: 'layer_feed', label: 'Layer Feed' },
  { value: 'broiler_feed', label: 'Broiler Feed' },
  { value: 'starter_feed', label: 'Starter Feed' },
  { value: 'grower_feed', label: 'Grower Feed' },
  { value: 'finisher_feed', label: 'Finisher Feed' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'other', label: 'Other' },
];

const fieldClass =
  'mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white max-md:min-h-12 max-md:rounded-xl max-md:px-3.5 max-md:text-base [font-size:16px]';

export default function FeedManagementPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const [feedStock, setFeedStock] = useState<FeedStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FeedStock | null>(null);
  const [formData, setFormData] = useState<FeedFormData>({
    stockType: 'layer_feed',
    name: '',
    quantity: 0,
    unit: 'kg',
    minimumThreshold: 5,
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchFeedStock();
  }, [farmId]);

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

  const totalStock = feedStock.reduce((sum: number, item: FeedStock) => sum + item.quantity, 0);
  const lowStockCount = feedStock.filter((item) => item.quantity <= item.minimumThreshold).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = editingItem
        ? await apiClient.updateFeedstock(farmId, editingItem._id, formData)
        : await apiClient.createFeedstock(farmId, formData);

      if (!response.success) {
        throw new Error(response.error || `Failed to ${editingItem ? 'update' : 'create'} feedstock`);
      }

      await fetchFeedStock();
      setShowAddForm(false);
      setEditingItem(null);
      setFormData({
        stockType: 'layer_feed',
        name: '',
        quantity: 0,
        unit: 'kg',
        minimumThreshold: 5,
        supplier: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleEdit = (item: FeedStock) => {
    setEditingItem(item);
    setFormData({
      stockType: item.stockType,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minimumThreshold: item.minimumThreshold,
      supplier: item.supplier || '',
      purchaseDate: item.purchaseDate.split('T')[0],
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      costPerUnit: item.costPerUnit,
      totalCost: item.totalCost,
      notes: item.notes || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feed stock item?')) {
      return;
    }

    try {
      const response = await apiClient.deleteFeedstock(farmId, id);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete feedstock');
      }

      await fetchFeedStock();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const formatStockType = (stockType: string) => {
    return STOCK_TYPES.find((type) => type.value === stockType)?.label || stockType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const resetFormClose = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      stockType: 'layer_feed',
      name: '',
      quantity: 0,
      unit: 'kg',
      minimumThreshold: 5,
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <>
      <div className="max-md:px-0 md:max-w-7xl md:mx-auto md:py-8 md:px-6 lg:px-8 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
        <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-xl md:shadow-lg max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
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
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 max-md:min-h-12 max-md:rounded-xl md:mt-0 md:w-auto"
              >
                + Add feed stock
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-md:mx-3 mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40 md:rounded-lg">
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
            <div className="flex items-center">
              <div className="rounded-full bg-primary-100 p-3 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m16-5H4m16 0l-3-3m3 3l-3 3" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Feed in Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStock} kg</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="flex items-center">
              <div className="rounded-full bg-primary-100 p-3 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Feed Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{feedStock.length} types</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="flex items-center">
              <div className="rounded-full bg-primary-100 p-3 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockCount} items</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:bg-white max-md:shadow-md dark:max-md:border-gray-700/80 dark:max-md:bg-gray-800 md:mt-8 md:rounded-lg md:bg-white md:shadow dark:md:bg-gray-800">
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
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
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
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="mr-4 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
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

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
          <div className="absolute inset-0 bg-gray-600/50 dark:bg-black/60" aria-hidden />
          <div className="relative mt-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-800 md:mt-0 md:rounded-lg md:p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingItem ? 'Edit Feed Stock' : 'Add New Feed Stock'}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Type</label>
                <select
                  value={formData.stockType}
                  onChange={(e) => setFormData({ ...formData, stockType: e.target.value })}
                  className={fieldClass}
                  required
                >
                  {STOCK_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={fieldClass}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className={fieldClass}
                    required
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className={fieldClass}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                    <option value="bags">bags</option>
                    <option value="tons">tons</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Threshold</label>
                <input
                  type="number"
                  value={formData.minimumThreshold}
                  onChange={(e) => setFormData({ ...formData, minimumThreshold: parseFloat(e.target.value) || 0 })}
                  className={fieldClass}
                  required
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className={fieldClass}
                  required
                />
              </div>

              <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0">
                <button
                  type="button"
                  onClick={resetFormClose}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto md:rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-transparent bg-primary-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 sm:w-auto md:rounded-md"
                >
                  {editingItem ? 'Update' : 'Add'} Feed Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
