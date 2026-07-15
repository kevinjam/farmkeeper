'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { isCloudinaryReceiptUrl } from '@/lib/receiptUpload';
import { useFarmPaths } from '@/hooks/useFarmPaths';

interface FinancialRecord {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  paymentMethod?: string;
  reference?: string;
  tags?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  type: 'income' | 'expense';
  category: string;
  amount: string;
  currency: string;
  description: string;
  date: string;
  paymentMethod: string;
  reference: string;
  tags: string;
}

const FinancialRecordsManager = () => {
  const params = useParams();
  const farmSlug = params.farmId as string;
  const { farmPath } = useFarmPaths(farmSlug);

  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openingReceiptId, setOpeningReceiptId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    type: 'income',
    category: '',
    amount: '',
    currency: 'UGX',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: '',
    tags: ''
  });

  const categories = {
    income: [
      { value: 'egg_sales', label: 'Egg Sales' },
      { value: 'livestock_sales', label: 'Livestock Sales' },
      { value: 'crop_sales', label: 'Crop Sales' },
      { value: 'other', label: 'Other Income' }
    ],
    expense: [
      { value: 'feed_purchase', label: 'Feed Purchase' },
      { value: 'veterinary', label: 'Veterinary' },
      { value: 'equipment', label: 'Equipment' },
      { value: 'labor', label: 'Labor' },
      { value: 'utilities', label: 'Utilities' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'other', label: 'Other Expense' }
    ]
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'check', label: 'Check' },
    { value: 'other', label: 'Other' }
  ];

  // Helper functions
  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (record: FinancialRecord) =>
    categories[record.type].find((cat) => cat.value === record.category)?.label || record.category;

  const openReceipt = async (recordId: string, storedUrl: string) => {
    let blobUrl: string | null = null;

    try {
      setOpeningReceiptId(recordId);

      if (isCloudinaryReceiptUrl(storedUrl)) {
        // Proxy through API so auth + Cloudinary signing work reliably for PDFs.
        const blob = await apiClient.fetchReceiptBlob(farmSlug, storedUrl);
        blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      window.open(storedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error opening receipt:', err);
      alert(err instanceof Error ? err.message : 'Could not open receipt');
    } finally {
      setOpeningReceiptId(null);
      if (blobUrl) {
        setTimeout(() => URL.revokeObjectURL(blobUrl!), 60_000);
      }
    }
  };

  // Fetch financial records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getFinancialTransactions(farmSlug);
      if (response.success) {
        setRecords(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch financial records');
      }
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Error loading financial records');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        date: formData.date,
        ...(formData.paymentMethod && { paymentMethod: formData.paymentMethod }),
        ...(formData.reference && { reference: formData.reference }),
        ...(formData.tags && { tags: formData.tags.split(',').map(tag => tag.trim()) })
      };

      let response;
      if (editingRecord) {
        response = await apiClient.updateFinancialTransaction(farmSlug, editingRecord._id, payload);
      } else {
        response = await apiClient.createFinancialTransaction(farmSlug, payload);
      }

      if (response.success) {
        setShowForm(false);
        setEditingRecord(null);
        resetForm();
        fetchRecords();
      } else {
        setError(response.error || 'Failed to save record');
      }
    } catch (err) {
      console.error('Error saving record:', err);
      setError('Error saving record');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await apiClient.deleteFinancialTransaction(farmSlug, recordId);

      if (response.success) {
        fetchRecords();
      } else {
        setError(response.error || 'Failed to delete record');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Error deleting record');
    }
  };

  // Handle edit
  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      category: record.category,
      amount: record.amount.toString(),
      currency: record.currency,
      description: record.description,
      date: record.date.split('T')[0],
      paymentMethod: record.paymentMethod || '',
      reference: record.reference || '',
      tags: record.tags?.join(', ') || ''
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'income',
      category: '',
      amount: '',
      currency: 'UGX',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      reference: '',
      tags: ''
    });
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white md:text-2xl">
            Recent activity
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 md:text-sm md:text-gray-600">
            {loading ? 'Loading…' : `${records.length} transaction${records.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRecord(null);
            resetForm();
            setShowForm(true);
          }}
          className="hidden shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 md:inline-flex"
        >
          <Plus className="h-5 w-5" />
          <span>Add record</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl dark:bg-gray-800 md:max-w-2xl md:rounded-lg">
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600 md:hidden" />
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingRecord ? 'Edit Financial Record' : 'Add Financial Record'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {categories[formData.type].map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col-reverse gap-2 pt-4 md:flex-row md:justify-end md:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRecord(null);
                      resetForm();
                    }}
                    className="min-h-11 rounded-xl border border-gray-300 px-4 py-2 text-gray-700 active:scale-[0.98] dark:border-gray-600 dark:text-gray-300 md:min-h-0 md:rounded-md md:hover:bg-gray-50 dark:md:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-11 rounded-xl bg-primary-600 px-4 py-2 text-white active:scale-[0.98] hover:bg-primary-700 disabled:opacity-50 md:min-h-0 md:rounded-md"
                  >
                    {submitting ? 'Saving...' : (editingRecord ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Records */}
      <div className="overflow-hidden md:rounded-lg md:bg-white md:shadow md:dark:bg-gray-800">
        {loading ? (
          <div className="space-y-2 py-4 md:p-8 md:text-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[4.5rem] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800/80 md:hidden"
              />
            ))}
            <div className="hidden md:block">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading records...</p>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center dark:border-gray-600 dark:bg-gray-900/40">
            <FileText className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">No transactions yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Log an expense or record a sale to get started.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 md:inline-flex md:gap-2">
              <Link
                href={farmPath('/dashboard/finances/expense')}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-3 text-sm font-semibold text-white active:scale-[0.98]"
              >
                Add expense
              </Link>
              <Link
                href={farmPath('/dashboard/finances/income')}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white active:scale-[0.98]"
              >
                Record sale
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <ul className="divide-y divide-gray-100 dark:divide-gray-800 md:hidden">
              {records.map((record) => (
                <li key={record._id} className="py-3.5 first:pt-0">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        record.type === 'income'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                      }`}
                    >
                      {record.type === 'income' ? '+' : '−'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">
                            {record.description}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {getCategoryLabel(record)} · {formatDateShort(record.date)}
                          </p>
                        </div>
                        <p
                          className={`shrink-0 text-[15px] font-bold tabular-nums ${
                            record.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {record.type === 'income' ? '+' : '−'}
                          {formatCurrency(record.amount, record.currency).replace(`${record.currency} `, '')}
                        </p>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {record.attachments?.[0] && (
                          <button
                            type="button"
                            onClick={() => openReceipt(record._id, record.attachments![0])}
                            disabled={openingReceiptId === record._id}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 active:scale-[0.98] disabled:opacity-50 dark:bg-primary-900/30 dark:text-primary-300"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {openingReceiptId === record._id ? 'Opening…' : 'Receipt'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEdit(record)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 active:scale-[0.98] dark:border-gray-600 dark:text-gray-300"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200/80 px-2.5 py-1 text-xs font-medium text-red-600 active:scale-[0.98] dark:border-red-900/40 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.type === 'income' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {record.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getCategoryLabel(record)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate" title={record.description}>
                        {record.description}
                      </div>
                      {record.attachments?.[0] && (
                        <button
                          type="button"
                          onClick={() => openReceipt(record._id, record.attachments![0])}
                          disabled={openingReceiptId === record._id}
                          className="mt-1 inline-flex text-xs font-medium text-primary-600 hover:underline disabled:opacity-50 dark:text-primary-400"
                        >
                          {openingReceiptId === record._id ? 'Opening…' : 'View receipt'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount, record.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
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
};

export default FinancialRecordsManager;
