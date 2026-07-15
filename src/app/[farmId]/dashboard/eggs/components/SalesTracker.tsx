'use client';

import { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface SalesRecord {
  _id: string;
  date: string;
  quantity: number;
  price: number;
  customer: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

interface SalesTrackerProps {
  farmId: string;
}

const inputClass =
  'mt-1 block w-full min-h-11 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:min-h-0 md:rounded-md md:py-2 md:text-sm';

export default function SalesTracker({ farmId }: SalesTrackerProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setLoadError('');

      const response = await apiClient.getEggSales(farmId);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch sales records');
      }

      setSales(response.data || []);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load');
      console.error('Error fetching sales records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [farmId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!date || !quantity || !price || !customer || !paymentMethod) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      setFormSuccess('');

      const response = await apiClient.createEggSale(farmId, {
        date,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        customer,
        paymentMethod,
        notes,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save sales record');
      }

      setQuantity('');
      setPrice('');
      setCustomer('');
      setNotes('');
      setFormSuccess('Sale recorded!');

      fetchSales();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sales record?')) {
      return;
    }

    try {
      const response = await apiClient.deleteEggSale(farmId, id);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete sales record');
      }

      fetchSales();
    } catch (err: unknown) {
      alert(`Error: ${err instanceof Error ? err.message : 'Delete failed'}`);
    }
  };

  const calculateTotalRevenue = () => sales.reduce((total, sale) => total + sale.quantity * sale.price, 0);

  return (
    <div className="space-y-6 md:space-y-6">
      <div className="max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:p-0 max-md:shadow-none md:rounded-lg md:border md:border-gray-200/80 md:bg-white md:p-6 md:shadow dark:md:border-gray-700 dark:md:bg-gray-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white md:mb-4 md:text-xl md:font-semibold">
          Record sale
        </h2>

        <form onSubmit={handleSubmit} className="mt-3 md:mt-0">
          {formError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300" role="alert">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" role="alert">
              {formSuccess}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
                Date *
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
                  Eggs *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                  inputMode="numeric"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
                  Price/egg *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`${inputClass} pl-7`}
                    placeholder="0.00"
                    inputMode="decimal"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
                Customer *
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className={inputClass}
                placeholder="Name or Market"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
                Payment *
              </label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass} required>
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="mobile">Mobile Payment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-semibold text-gray-700 dark:text-gray-300 md:text-sm md:font-medium">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className="mt-4 md:flex md:justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 active:scale-[0.98] disabled:opacity-50 md:min-h-0 md:w-auto md:rounded-md md:from-emerald-600 md:to-emerald-600 md:shadow-sm md:hover:bg-emerald-700"
            >
              {isSubmitting ? 'Saving…' : 'Record sale'}
            </button>
          </div>
        </form>
      </div>

      <div className="max-md:-mx-0 max-md:border-t max-md:border-gray-100 max-md:pt-5 max-md:dark:border-gray-700 md:rounded-lg md:border md:border-gray-200/80 md:bg-white md:shadow dark:md:border-gray-700 dark:md:bg-gray-800">
        <div className="flex items-start justify-between gap-3 md:p-6 md:pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white md:text-xl md:font-semibold">
              Sales history
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 md:hidden">
              {isLoading ? 'Loading…' : `${sales.length} sale${sales.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-right dark:bg-emerald-950/40 md:bg-transparent md:p-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Revenue</p>
            <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400 md:text-xl">
              ${calculateTotalRevenue().toFixed(2)}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 py-2 md:p-6 md:pt-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[4.5rem] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800/80 md:hidden" />
            ))}
            <div className="hidden md:block md:text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading sales…</p>
            </div>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950/40 md:m-6 md:mt-0">
            <p className="text-sm text-red-600 dark:text-red-300">{loadError}</p>
            <button type="button" onClick={fetchSales} className="mt-2 text-sm font-semibold text-emerald-600">
              Retry
            </button>
          </div>
        ) : sales.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center dark:border-gray-600 dark:bg-gray-900/40 md:m-6 md:mt-0">
            <ShoppingCart className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">No sales yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Record your first sale above.</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800 md:hidden">
              {sales.map((sale) => (
                <li key={sale._id} className="py-3.5 first:pt-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">{sale.customer}</p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(sale.date), 'MMM d')} · {sale.quantity} eggs ·{' '}
                            <span className="capitalize">{sale.paymentMethod}</span>
                          </p>
                        </div>
                        <p className="shrink-0 text-[15px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                          ${(sale.quantity * sale.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        ${sale.price.toFixed(2)} per egg
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDelete(sale._id)}
                        className="mt-2.5 inline-flex items-center gap-1 rounded-lg border border-red-200/80 px-2.5 py-1 text-xs font-medium text-red-600 active:scale-[0.98] dark:border-red-900/40 dark:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Price/Egg
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Payment
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(sale.date), 'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {sale.customer}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {sale.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        ${sale.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                        ${(sale.quantity * sale.price).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-900 dark:text-gray-100">
                        {sale.paymentMethod}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button type="button" onClick={() => handleDelete(sale._id)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
