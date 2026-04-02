'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Beef,
  ChevronRight,
  Heart,
  Plus,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { AddLivestockModal } from '@/components/AddLivestockModal';
import { apiClient } from '@/lib/api';

// Define type for livestock data
type Livestock = {
  _id: string;
  name: string;
  type: string;
  breed?: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  acquisitionDate: string;
  healthStatus: 'healthy' | 'sick' | 'recovering' | 'quarantine';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Define types for filter and sort options
type FilterOption = {
  label: string;
  value: string;
};

// Define livestock type options
const livestockTypes: FilterOption[] = [
  { label: 'All Types', value: 'all' },
  { label: 'Chicken', value: 'chicken' },
  { label: 'Cow', value: 'cow' },
  { label: 'Goat', value: 'goat' },
  { label: 'Sheep', value: 'sheep' },
  { label: 'Pig', value: 'pig' },
  { label: 'Duck', value: 'duck' },
  { label: 'Turkey', value: 'turkey' },
  { label: 'Other', value: 'other' },
];

// Define status options
const statusOptions: FilterOption[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Healthy', value: 'healthy' },
  { label: 'Sick', value: 'sick' },
  { label: 'Recovering', value: 'recovering' },
  { label: 'Quarantine', value: 'quarantine' },
];

// Define sort options
const sortOptions: FilterOption[] = [
  { label: 'Date Added (Newest)', value: 'date-desc' },
  { label: 'Date Added (Oldest)', value: 'date-asc' },
  { label: 'Age (Oldest)', value: 'quantity-desc' },
  { label: 'Age (Youngest)', value: 'quantity-asc' },
];

function healthStatusBadgeClass(status: Livestock['healthStatus']) {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200';
    case 'sick':
      return 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200';
    case 'quarantine':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100';
    case 'recovering':
      return 'bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

function shortId(id: string) {
  if (id.length <= 14) return id;
  return `…${id.slice(-8)}`;
}

export default function LivestockPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  
  // State for livestock data
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  
  // State for filters and sorting
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('date-desc');
  
  // State for loading and error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // State for add livestock modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Fetch livestock data
  useEffect(() => {
    if (!farmId) {
      console.log('farmId not available yet:', farmId);
      return; // Don't fetch if farmId is not available yet
    }
    
    console.log('Fetching livestock for farmId:', farmId);
    const fetchLivestock = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await apiClient.getLivestock(farmId);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch livestock data');
        }
        
        setLivestock(response.data || []);
      } catch (err) {
        console.error('Error fetching livestock:', err);
        setError('Failed to load livestock data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLivestock();
  }, [farmId]);

  // Delete livestock function
  const handleDeleteLivestock = async (livestockId: string) => {
    try {
      const response = await apiClient.deleteLivestock(farmId, livestockId);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete livestock');
      }

      // Remove from local state
      setLivestock(prev => prev.filter(item => item._id !== livestockId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting livestock:', err);
      setError('Failed to delete livestock. Please try again.');
    }
  };
  
  // Filter and sort livestock data
  const filteredAndSortedLivestock = livestock
    // Filter by type
    .filter(item => selectedType === 'all' || item.type === selectedType)
    // Filter by status
    .filter(item => selectedStatus === 'all' || item.healthStatus === selectedStatus)
    // Filter by search query
    .filter(item => 
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Sort data
    .sort((a, b) => {
      switch (selectedSort) {
        case 'date-desc':
          return new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime();
        case 'date-asc':
          return new Date(a.acquisitionDate).getTime() - new Date(b.acquisitionDate).getTime();
        case 'quantity-desc':
          return b.age - a.age; // Sort by age instead of quantity
        case 'quantity-asc':
          return a.age - b.age;
        default:
          return 0;
      }
    });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedLivestock.length / itemsPerPage);
  const paginatedLivestock = filteredAndSortedLivestock.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UG', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get readable livestock type
  const getLivestockTypeLabel = (typeValue: string) => {
    const type = livestockTypes.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
  };

  // Calculate summary statistics
  const totalAnimals = livestock.length;
  const healthyCount = livestock.filter(item => item.healthStatus === 'healthy').length;
  const sickCount = livestock.filter(item => item.healthStatus === 'sick').length;
  const quarantinedCount = livestock.filter(item => item.healthStatus === 'quarantine').length;

  if (isLoading) {
    return (
      <div className="space-y-4 max-md:px-0 md:space-y-6 max-md:pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <div className="bg-white dark:bg-gray-800 max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:p-4 max-md:shadow-md md:rounded-lg md:shadow md:p-6">
          <div className="flex items-start gap-3 md:flex-col md:gap-0">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-gray-200 animate-pulse md:hidden" />
            <div className="min-w-0 flex-1">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-2 animate-pulse md:h-8 md:w-64" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md animate-pulse" />
            </div>
            <div className="hidden md:block md:mt-4 h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="mt-4 h-11 w-full rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse md:hidden" />
        </div>

        <div className="grid grid-cols-2 gap-2 px-3 md:hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[7.25rem] rounded-xl border border-gray-200/80 bg-gray-100/80 dark:border-gray-700 dark:bg-gray-800/80 p-3 animate-pulse"
            />
          ))}
        </div>
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:p-4 md:rounded-lg md:shadow md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-10 md:h-10 min-h-12 bg-gray-200 dark:bg-gray-700 rounded-xl md:rounded-md w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 px-3 md:hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-sm animate-pulse"
            />
          ))}
        </div>

        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-md:mx-3 max-md:mt-2 rounded-2xl border border-red-200/80 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40 md:rounded-md">
        <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
      </div>
    );
  }

  const pct = (n: number) => (totalAnimals > 0 ? ((n / totalAnimals) * 100).toFixed(1) : '0.0');

  const filterInputClass =
    'input w-full max-md:min-h-12 max-md:rounded-xl max-md:text-base [font-size:16px]';

  const emptyListMessage = (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-12 text-center dark:border-gray-600 dark:bg-gray-900/40">
      <div className="text-5xl mb-3" aria-hidden>
        🐄
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">No livestock found</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Try adjusting your filters or add animals to get started.
      </p>
      <Link
        href={`/${farmId}/dashboard/livestock/add`}
        className="btn btn-primary mt-5 inline-flex items-center justify-center gap-2 max-md:min-h-12 max-md:w-full max-md:rounded-xl"
      >
        <Plus className="h-5 w-5" strokeWidth={2} />
        Add livestock
      </Link>
    </div>
  );

  return (
    <div className="space-y-4 max-md:px-0 md:space-y-6 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      {/* Page header */}
      <div className="overflow-hidden bg-white shadow-md dark:bg-gray-800 md:rounded-lg md:shadow max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80">
        <div className="max-md:bg-gradient-to-br max-md:from-emerald-500/12 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-emerald-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex max-md:flex-col md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex max-md:items-start max-md:gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 md:hidden">
                <Beef className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Livestock</h2>
                <p className="mt-0.5 text-[13px] leading-snug text-gray-600 dark:text-gray-300 md:mt-1 md:text-sm">
                  Track and manage all your farm animals in one place
                </p>
              </div>
            </div>
            <Link
              href={`/${farmId}/dashboard/livestock/add`}
              className="btn btn-primary mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 max-md:min-h-12 max-md:rounded-xl md:mt-0 md:w-auto"
            >
              <Plus className="h-5 w-5 md:h-4 md:w-4" strokeWidth={2} />
              Add livestock
            </Link>
          </div>
        </div>
      </div>

      {/* Summary stats — compact 2×2 on mobile */}
      <div className="grid grid-cols-2 gap-2 px-3 md:hidden">
        <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 via-white to-white p-3 shadow-md dark:from-emerald-500/16 dark:via-gray-900 dark:to-gray-900/95 dark:border-emerald-500/25">
          <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-emerald-500/50 opacity-90" />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</p>
          <p className="mt-1 text-[1.35rem] font-extrabold tabular-nums text-emerald-950 dark:text-emerald-100">
            {totalAnimals}
          </p>
          <p className="mt-auto text-[10px] font-medium leading-tight text-gray-500 dark:text-gray-400">
            On record
          </p>
        </div>
        <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-green-500/25 bg-gradient-to-br from-green-500/10 via-white to-white p-3 shadow-md dark:from-green-500/14 dark:via-gray-900 dark:to-gray-900/95 dark:border-green-500/20">
          <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-green-500/45 opacity-90" />
          <div className="flex items-start justify-between gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Healthy
            </p>
            <Heart className="h-4 w-4 text-green-600 dark:text-green-400" strokeWidth={2} />
          </div>
          <p className="mt-1 text-[1.35rem] font-extrabold tabular-nums text-green-700 dark:text-green-300">
            {healthyCount}
          </p>
          <p className="mt-auto text-[10px] font-medium text-gray-500 dark:text-gray-400">{pct(healthyCount)}% of herd</p>
        </div>
        <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-red-500/25 bg-gradient-to-br from-red-500/10 via-white to-white p-3 shadow-md dark:from-red-500/14 dark:via-gray-900 dark:to-gray-900/95 dark:border-red-500/20">
          <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-red-500/45 opacity-90" />
          <div className="flex items-start justify-between gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Sick</p>
            <Stethoscope className="h-4 w-4 text-red-600 dark:text-red-400" strokeWidth={2} />
          </div>
          <p className="mt-1 text-[1.35rem] font-extrabold tabular-nums text-red-700 dark:text-red-300">{sickCount}</p>
          <p className="mt-auto text-[10px] font-medium text-gray-500 dark:text-gray-400">{pct(sickCount)}% of herd</p>
        </div>
        <div className="relative flex h-[7.25rem] flex-col rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-400/12 via-white to-white p-3 shadow-md dark:from-amber-500/14 dark:via-gray-900 dark:to-gray-900/95 dark:border-amber-500/25">
          <div className="pointer-events-none absolute left-0 top-0 h-1 w-full rounded-t-xl bg-amber-500/50 opacity-90" />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Quarantine
          </p>
          <p className="mt-1 text-[1.35rem] font-extrabold tabular-nums text-amber-800 dark:text-amber-200">
            {quarantinedCount}
          </p>
          <p className="mt-auto text-[10px] font-medium text-gray-500 dark:text-gray-400">{pct(quarantinedCount)}% of herd</p>
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Livestock</p>
          <h3 className="text-2xl font-bold mt-1">{totalAnimals}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Across {livestock.length} different groups</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Healthy</p>
          <h3 className="text-2xl font-bold mt-1 text-green-600">{healthyCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">{pct(healthyCount)}% of total livestock</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sick</p>
          <h3 className="text-2xl font-bold mt-1 text-red-600">{sickCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">{pct(sickCount)}% of total livestock</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Quarantined</p>
          <h3 className="text-2xl font-bold mt-1 text-yellow-600">{quarantinedCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">{pct(quarantinedCount)}% of total livestock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:p-4 max-md:shadow-md dark:max-md:border-gray-700/80 md:rounded-lg md:shadow md:p-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 md:hidden">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          Filters &amp; sort
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 max-md:text-[13px] max-md:font-semibold">
              Livestock Type
            </label>
            <select
              id="type-filter"
              className={filterInputClass}
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
            >
              {livestockTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 max-md:text-[13px] max-md:font-semibold">
              Health Status
            </label>
            <select
              id="status-filter"
              className={filterInputClass}
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 max-md:text-[13px] max-md:font-semibold">
              Sort By
            </label>
            <select
              id="sort-by"
              className={filterInputClass}
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 max-md:text-[13px] max-md:font-semibold">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 max-md:left-3.5" />
              <input
                type="text"
                id="search"
                placeholder="Name, breed, ID, notes…"
                className={`${filterInputClass} max-md:pl-10 md:pl-10`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="space-y-3 px-3 md:hidden">
        {paginatedLivestock.length > 0 ? (
          paginatedLivestock.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700/80 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-300">
                    {getLivestockTypeLabel(item.type)}
                    <span className="text-gray-400 dark:text-gray-500"> · </span>
                    <span>{item.breed || 'N/A'}</span>
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${healthStatusBadgeClass(item.healthStatus)}`}
                >
                  {item.healthStatus}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-500">ID</dt>
                  <dd className="mt-0.5 font-mono text-[11px] text-gray-800 dark:text-gray-200">{shortId(item._id)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-500">Age</dt>
                  <dd className="mt-0.5 text-gray-900 dark:text-white">{item.age}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-500">Acquired</dt>
                  <dd className="mt-0.5">{formatDate(item.acquisitionDate)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-500">Updated</dt>
                  <dd className="mt-0.5">{formatDate(item.updatedAt)}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700/80">
                <Link
                  href={`/${farmId}/dashboard/livestock/${item._id}`}
                  className="inline-flex flex-1 min-w-[5.5rem] items-center justify-center gap-1 rounded-xl bg-primary-600 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm active:scale-[0.98] dark:bg-primary-500"
                >
                  View
                  <ChevronRight className="h-4 w-4 opacity-90" />
                </Link>
                <Link
                  href={`/${farmId}/dashboard/livestock/${item._id}/edit`}
                  className="inline-flex flex-1 min-w-[5.5rem] items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-gray-800 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(item._id)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 active:scale-[0.98] dark:border-red-900/50 dark:text-red-400"
                  aria-label="Delete livestock"
                >
                  <Trash2 className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))
        ) : (
          emptyListMessage
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/90 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${
                currentPage === 1
                  ? 'cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-600'
                  : 'border-gray-300 bg-white text-gray-800 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
              }`}
            >
              Previous
            </button>
            <p className="shrink-0 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
              {currentPage} / {totalPages}
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${
                currentPage === totalPages
                  ? 'cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-600'
                  : 'border-gray-300 bg-white text-gray-800 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Type/Breed
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Age
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Acquisition Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Health Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Last Updated
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedLivestock.length > 0 ? (
                paginatedLivestock.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>{getLivestockTypeLabel(item.type)}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{item.breed || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.acquisitionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${healthStatusBadgeClass(item.healthStatus)}`}
                      >
                        {item.healthStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/${farmId}/dashboard/livestock/${item._id}`}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/${farmId}/dashboard/livestock/${item._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(item._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="text-center text-gray-500 py-12">
                      <div className="text-6xl mb-4">🐄</div>
                      <h3 className="text-lg font-medium mb-2">No livestock found</h3>
                      <p className="text-gray-400">Try adjusting your filters or add some livestock to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700'
                    : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedLivestock.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAndSortedLivestock.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === i + 1
                          ? 'bg-primary-50 dark:bg-primary-900 border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-200'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } text-sm font-medium`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddLivestockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        farmId={farmId}
        onSuccess={async () => {
          try {
            const response = await apiClient.getLivestock(farmId);
            if (response.success) {
              setLivestock(response.data || []);
            }
          } catch (err) {
            console.error('Error refreshing livestock:', err);
          }
        }}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4" role="dialog" aria-modal="true" aria-labelledby="delete-livestock-title">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 dark:bg-black/60"
            aria-label="Dismiss"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-md rounded-t-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/70">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
            </div>
            <h3 id="delete-livestock-title" className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
              Delete livestock?
            </h3>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              This cannot be undone. The animal record will be removed from your farm.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-center">
              <button
                type="button"
                onClick={() => handleDeleteLivestock(deleteConfirm)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white active:scale-[0.98] dark:bg-red-500 sm:w-auto sm:min-w-[8rem]"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto sm:min-w-[8rem]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
