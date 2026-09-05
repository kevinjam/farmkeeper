'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Archive,
  ChevronRight,
  Eye,
  Leaf,
  MapPinned,
  Pencil,
  Plus,
  Search,
  Sprout,
  Trash2,
} from 'lucide-react';
import CropRemoveDialog from '@/components/crops/CropRemoveDialog';
import CropListSignal from '@/components/crops/CropListSignal';
import FarmInsightsCard from '@/components/crops/FarmInsightsCard';
import HarvestSalesCard from '@/components/dashboard/HarvestSalesCard';
import RecentCropActivityCard from '@/components/dashboard/RecentCropActivityCard';
import { CROP_NOTICE, NoticeBanner, useFlashNotice } from '@/components/NoticeBanner';
import { formatCropActivityDate } from '@/lib/cropActivities';
import { apiClient } from '@/lib/api';
import HelpHint from '@/components/help/HelpHint';
import { useFarmPaths } from '@/hooks/useFarmPaths';
import {
  CROP_STATUSES,
  CROP_TYPES,
  cropFieldId,
  cropFieldName,
  cropStatusBadgeClass,
  formatCropAreaTotal,
  formatCropArea,
  formatCropDate,
  formatCropStatusLabel,
  formatCropTypeLabel,
  type CropRecord,
  type FarmField,
} from '@/lib/crops';

type ConfirmState = { id: string; name: string; archived: boolean };

export default function CropsDashboard({ params }: { params: { farmId: string } }) {
  const { farmId, farmPath } = useFarmPaths(params.farmId);
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [fields, setFields] = useState<FarmField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const { message: notice, setMessage: setNotice, clear: clearNotice } = useFlashNotice();

  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedSort, setSelectedSort] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cropsResponse, fieldsResponse] = await Promise.all([
        apiClient.getCrops(farmId, { archived: 'all' }),
        apiClient.getFields(farmId),
      ]);

      if (!cropsResponse.success) {
        throw new Error(cropsResponse.error || 'Failed to fetch crops');
      }

      setCrops((cropsResponse.data || []) as CropRecord[]);
      setFields((fieldsResponse.success ? fieldsResponse.data || [] : []) as FarmField[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching crops:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch crops');
    } finally {
      setIsLoading(false);
    }
  }, [farmId]);

  const handleArchive = async (cropId: string, archived: boolean) => {
    try {
      setIsWorking(true);
      setActionError(null);
      const response = await apiClient.updateCrop(farmId, cropId, { archived });
      if (!response.success) {
        throw new Error(response.error || 'Failed to update crop');
      }
      setCrops((prev) =>
        prev.map((crop) => (crop._id === cropId ? { ...crop, archived } : crop))
      );
      setConfirm(null);
      setNotice(archived ? CROP_NOTICE.archived : CROP_NOTICE.restored);
    } catch (err) {
      console.error('Error updating crop:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to update crop');
    } finally {
      setIsWorking(false);
    }
  };

  const handleDelete = async (cropId: string) => {
    try {
      setIsWorking(true);
      setActionError(null);
      const response = await apiClient.deleteCrop(farmId, cropId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete crop');
      }
      setCrops((prev) => prev.filter((crop) => crop._id !== cropId));
      setConfirm(null);
      setNotice(CROP_NOTICE.deleted);
    } catch (err) {
      console.error('Error deleting crop:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to delete crop');
    } finally {
      setIsWorking(false);
    }
  };

  useEffect(() => {
    if (!farmId) return;
    void fetchData();
  }, [farmId, fetchData]);

  const activeCrops = useMemo(() => crops.filter((crop) => !crop.archived), [crops]);
  const archivedCrops = useMemo(() => crops.filter((crop) => crop.archived), [crops]);
  const sourceList = showArchived ? archivedCrops : activeCrops;

  const filteredCrops = sourceList
    .filter((crop) => selectedType === 'all' || crop.cropType === selectedType)
    .filter((crop) => selectedStatus === 'all' || crop.status === selectedStatus)
    .filter((crop) => {
      if (selectedField === 'all') return true;
      if (selectedField === 'none') return !cropFieldId(crop.fieldId) && !crop.location;
      return cropFieldId(crop.fieldId) === selectedField || cropFieldName(crop) === selectedField;
    })
    .filter((crop) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        crop.name.toLowerCase().includes(q) ||
        (crop.variety || '').toLowerCase().includes(q) ||
        crop.cropType.toLowerCase().includes(q) ||
        cropFieldName(crop).toLowerCase().includes(q) ||
        (crop.notes || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'harvest-asc': {
          const aDate = a.expectedHarvestDate ? new Date(a.expectedHarvestDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bDate = b.expectedHarvestDate ? new Date(b.expectedHarvestDate).getTime() : Number.MAX_SAFE_INTEGER;
          return aDate - bDate;
        }
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalPages = Math.max(1, Math.ceil(filteredCrops.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const paginatedCrops = filteredCrops.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const typeFilterOptions = useMemo(() => {
    const options: { value: string; label: string }[] = CROP_TYPES.filter((type) => type.value !== 'other').map(
      (type) => ({
        value: type.value,
        label: type.label,
      })
    );
    const seen = new Set(options.map((type) => type.value));
    for (const crop of crops) {
      if (crop.cropType && !seen.has(crop.cropType)) {
        seen.add(crop.cropType);
        options.push({ value: crop.cropType, label: formatCropTypeLabel(crop.cropType) });
      }
    }
    return options;
  }, [crops]);

  const growingCount = activeCrops.filter((crop) =>
    ['planted', 'growing', 'harvesting'].includes(crop.status)
  ).length;
  const plannedCount = activeCrops.filter((crop) => crop.status === 'planned').length;
  const areaLabel = formatCropAreaTotal(activeCrops);

  const filterInputClass =
    'input w-full max-md:min-h-12 max-md:rounded-xl max-md:text-base [font-size:16px] md:min-h-9 md:rounded-lg md:py-1.5 md:text-sm';

  if (error) {
    return (
      <div className="max-md:mt-2 max-md:pb-[calc(6rem+env(safe-area-inset-bottom))] md:py-2">
        <div
          className="rounded-2xl border border-red-200/80 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40 md:rounded-lg"
          role="alert"
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-2 hover:no-underline dark:text-red-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const emptyList = (
    <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center dark:border-gray-600 dark:bg-gray-900/40 lg:mx-6 lg:my-4 lg:mt-4">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
        <Sprout className="h-6 w-6" strokeWidth={2} />
      </div>
      <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
        {showArchived ? 'No archived crops' : crops.length === 0 ? 'No crops yet' : 'No crops match your filters'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {showArchived
          ? 'Archived crops will appear here until you restore or delete them.'
          : crops.length === 0
            ? 'Add your first crop to start tracking what is planted on your farm.'
            : 'Try adjusting your filters or search.'}
      </p>
      {!showArchived && crops.length === 0 ? (
        <Link
          href={farmPath('/dashboard/crops/add')}
          className="btn btn-primary mt-5 inline-flex items-center justify-center gap-2 max-md:min-h-12 max-md:w-full max-md:rounded-xl"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          Add Crop
        </Link>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:gap-4 md:py-2">
      {notice ? (
        <NoticeBanner tone="success" onDismiss={clearNotice}>
          {notice}
        </NoticeBanner>
      ) : null}
      {actionError ? (
        <NoticeBanner tone="error" onDismiss={() => setActionError(null)}>
          {actionError}
        </NoticeBanner>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch lg:gap-4">
        <div className="flex min-h-0 flex-col overflow-hidden bg-white shadow-md dark:bg-gray-800 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 dark:max-md:border-gray-700/80 md:rounded-xl md:shadow-lg lg:col-span-7">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">Crop Management</h1>
              <p className="mt-0.5 truncate text-[13px] text-gray-500 dark:text-gray-400">
                {isLoading
                  ? 'Track the crops growing on your farm'
                  : `${activeCrops.length} active · ${areaLabel}`}
              </p>
              <HelpHint href={farmPath('/dashboard/help/articles/how-to-add-a-crop')}>
                Need help adding a crop?
              </HelpHint>
            </div>
            <div className="flex shrink-0 items-center gap-2">
            <Link
              href={farmPath('/dashboard/crops/add')}
              aria-label="Add Crop"
              className="btn btn-primary inline-flex shrink-0 items-center justify-center gap-1.5 max-md:min-h-11 max-md:rounded-xl max-md:px-3 md:min-h-9"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              <span className="hidden md:inline">Add Crop</span>
              <span className="md:hidden">Add</span>
            </Link>
            <Link
              href={farmPath('/dashboard/harvests')}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-300 px-3 text-sm font-semibold max-md:min-h-11 dark:border-gray-600"
            >
              Harvests
            </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700 lg:grid-cols-4">
            <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total crops
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-900 dark:text-white">
                {isLoading ? '—' : activeCrops.length}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Active records</p>
            </div>
            <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                In the field
                <Leaf className="h-3 w-3 text-green-600 dark:text-green-400" strokeWidth={2} />
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-green-700 dark:text-green-300">
                {isLoading ? '—' : growingCount}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Growing / harvest</p>
            </div>
            <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Fields
                <MapPinned className="h-3 w-3 text-sky-600 dark:text-sky-400" strokeWidth={2} />
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-sky-800 dark:text-sky-200">
                {isLoading ? '—' : fields.length}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Plots on this farm</p>
            </div>
            <div className="bg-white px-3 py-2.5 dark:bg-gray-800">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total area
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums leading-tight text-amber-800 dark:text-amber-200">
                {isLoading ? '—' : areaLabel}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {isLoading ? ' ' : `${plannedCount} planned`}
              </p>
            </div>
          </div>
        </div>
        <div className="min-h-0 overflow-hidden lg:col-span-5 lg:h-0 lg:min-h-full">
          <FarmInsightsCard farmId={farmId} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <HarvestSalesCard farmId={farmId} />
        <RecentCropActivityCard farmId={farmId} />
      </div>

      <div className="lg:overflow-hidden lg:rounded-xl lg:bg-white lg:shadow-lg dark:lg:bg-gray-800">
        <div className="bg-white max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:p-3 max-md:shadow-md dark:bg-gray-800 dark:max-md:border-gray-700/80 lg:border-b lg:border-gray-200 lg:bg-transparent lg:px-5 lg:py-3 dark:lg:border-gray-700">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {showArchived ? 'Archived crops' : 'Your crops'}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {filteredCrops.length} {filteredCrops.length === 1 ? 'crop' : 'crops'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowArchived((prev) => !prev);
                  setCurrentPage(1);
                }}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold md:min-h-8 ${
                  showArchived
                    ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'
                    : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                <Archive className="h-3.5 w-3.5" strokeWidth={2} />
                {showArchived ? 'Viewing archived' : `Archived (${archivedCrops.length})`}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <select
              id="crop-type-filter"
              aria-label="Crop type"
              className={filterInputClass}
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All types</option>
              {typeFilterOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              id="crop-status-filter"
              aria-label="Status"
              className={filterInputClass}
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All statuses</option>
              {CROP_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              id="crop-field-filter"
              aria-label="Field / plot"
              className={filterInputClass}
              value={selectedField}
              onChange={(e) => {
                setSelectedField(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All fields</option>
              <option value="none">Unassigned</option>
              {fields.map((field) => (
                <option key={field._id} value={field._id}>
                  {field.name}
                </option>
              ))}
            </select>
            <select
              id="crop-sort"
              aria-label="Sort by"
              className={filterInputClass}
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="name-asc">Name A–Z</option>
              <option value="harvest-asc">Harvest date</option>
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="crop-search"
                aria-label="Search crops"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Name, variety, field…"
                className={`${filterInputClass} pl-9`}
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <>
            <div className="mt-3 space-y-3 lg:mt-0 lg:hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl border border-gray-200/80 bg-gray-100/80 animate-pulse dark:border-gray-700 dark:bg-gray-900/50"
                />
              ))}
            </div>
            <div className="hidden animate-pulse p-6 lg:block">
              <div className="mb-4 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                ))}
              </div>
            </div>
          </>
        ) : filteredCrops.length === 0 ? (
          emptyList
        ) : (
          <>
            <div className="mt-3 space-y-3 lg:mt-0 lg:hidden">
              {paginatedCrops.map((crop, index) => (
                <div
                  key={crop._id}
                  className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-md dark:border-gray-700/80 dark:bg-gray-800/90"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-gray-900 dark:text-white">{crop.name}</p>
                      {crop.variety ? (
                        <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-300">{crop.variety}</p>
                      ) : null}
                      <CropListSignal signal={crop.insightSignal} />
                      <p className="mt-1 text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">
                        {(page - 1) * itemsPerPage + index + 1}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${cropStatusBadgeClass(crop.status)}`}
                    >
                      {formatCropStatusLabel(crop.status)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Type</dt>
                      <dd className="mt-0.5 capitalize text-gray-900 dark:text-gray-100">
                        {formatCropTypeLabel(crop.cropType)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Area</dt>
                      <dd className="mt-0.5 text-gray-900 dark:text-white">
                        {formatCropArea(crop.area, crop.areaUnit)}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Field / plot</dt>
                      <dd className="mt-0.5 flex items-start gap-1.5 text-gray-900 dark:text-gray-100">
                        <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {cropFieldName(crop) || 'Not assigned'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Planting date</dt>
                      <dd className="mt-0.5">{formatCropDate(crop.plantedDate)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Expected harvest</dt>
                      <dd className="mt-0.5">{formatCropDate(crop.expectedHarvestDate)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Activities</dt>
                      <dd className="mt-0.5 text-gray-900 dark:text-white">
                        {crop.activityCount || 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-500">Last activity</dt>
                      <dd className="mt-0.5">
                        {crop.activityCount
                          ? formatCropActivityDate(crop.lastActivityDate)
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700/80">
                    <Link
                      href={farmPath(`/dashboard/crops/${crop._id}`)}
                      className="inline-flex min-h-11 min-w-[5.5rem] flex-1 items-center justify-center gap-1 rounded-xl bg-primary-600 px-3 text-center text-sm font-semibold text-white shadow-sm active:scale-[0.98] dark:bg-primary-500"
                    >
                      View
                      <ChevronRight className="h-4 w-4 opacity-90" />
                    </Link>
                    <Link
                      href={farmPath(`/dashboard/crops/${crop._id}/edit`)}
                      className="inline-flex min-h-11 min-w-[5.5rem] flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white px-3 text-center text-sm font-semibold text-gray-800 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirm({ id: crop._id, name: crop.name, archived: Boolean(crop.archived) })}
                      className={`inline-flex h-11 shrink-0 items-center justify-center gap-1 rounded-xl border px-3 text-sm font-semibold active:scale-[0.98] ${
                        crop.archived
                          ? 'border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400'
                          : 'border-amber-200 text-amber-800 dark:border-amber-800 dark:text-amber-200'
                      }`}
                      aria-label={`${crop.archived ? 'Remove' : 'Archive'} ${crop.name}`}
                    >
                      {crop.archived ? (
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Archive className="h-4 w-4" strokeWidth={2} />
                      )}
                      {crop.archived ? 'Remove' : 'Archive'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Crop</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Field / plot</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Area</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Planting date</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Expected harvest</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Activities</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {paginatedCrops.map((crop, index) => (
                    <tr key={crop._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      <td className="whitespace-nowrap px-4 py-2.5 text-sm font-medium tabular-nums text-gray-900 dark:text-white">
                        {(page - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <div className="font-medium text-gray-900 dark:text-white">{crop.name}</div>
                        {crop.variety ? <div className="text-sm text-gray-500 dark:text-gray-400">{crop.variety}</div> : null}
                        <CropListSignal signal={crop.insightSignal} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 capitalize text-gray-700 dark:text-gray-300">
                        {formatCropTypeLabel(crop.cropType)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {cropFieldName(crop) || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {crop.area} {crop.areaUnit}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${cropStatusBadgeClass(crop.status)}`}>
                          {formatCropStatusLabel(crop.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {formatCropDate(crop.plantedDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {formatCropDate(crop.expectedHarvestDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {crop.activityCount || 0}
                        </div>
                        {crop.activityCount ? (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCropActivityDate(crop.lastActivityDate)}
                          </div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <div className="inline-flex items-center justify-end rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-900/50">
                          <Link
                            href={farmPath(`/dashboard/crops/${crop._id}`)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-gray-700 hover:bg-white hover:text-primary-700 hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-300"
                          >
                            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                            View
                          </Link>
                          <Link
                            href={farmPath(`/dashboard/crops/${crop._id}/edit`)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold text-gray-700 hover:bg-white hover:text-primary-700 hover:shadow-sm dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary-300"
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirm({ id: crop._id, name: crop.name, archived: Boolean(crop.archived) })}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold hover:shadow-sm ${
                              crop.archived
                                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50'
                                : 'text-amber-800 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-950/40'
                            }`}
                          >
                            {crop.archived ? (
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                            ) : (
                              <Archive className="h-3.5 w-3.5" strokeWidth={2} />
                            )}
                            {crop.archived ? 'Remove' : 'Archive'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-0 py-4 dark:border-gray-700 lg:px-6">
                <p className="hidden text-sm text-gray-600 dark:text-gray-400 sm:block">
                  Showing {(page - 1) * itemsPerPage + 1}–
                  {Math.min(page * itemsPerPage, filteredCrops.length)} of {filteredCrops.length}
                </p>
                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-gray-300 px-3 text-sm font-semibold disabled:opacity-50 dark:border-gray-600 sm:flex-none"
                  >
                    Previous
                  </button>
                  <p className="shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400 sm:hidden">
                    {page} / {totalPages}
                  </p>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-gray-300 px-3 text-sm font-semibold disabled:opacity-50 dark:border-gray-600 sm:flex-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {confirm ? (
        <CropRemoveDialog
          cropName={confirm.name}
          archived={confirm.archived}
          isWorking={isWorking}
          onClose={() => setConfirm(null)}
          onArchive={() => void handleArchive(confirm.id, true)}
          onRestore={() => void handleArchive(confirm.id, false)}
          onDelete={() => void handleDelete(confirm.id)}
        />
      ) : null}
    </div>
  );
}
