'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
        <p className="text-red-600 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Livestock Management</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Track and manage all your farm animals in one place
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              href={`/${farmId}/dashboard/livestock/add`}
              className="btn btn-primary"
            >
              Add Livestock
            </Link>
          </div>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Livestock</p>
          <h3 className="text-2xl font-bold mt-1">{totalAnimals}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            Across {livestock.length} different groups
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Healthy</p>
          <h3 className="text-2xl font-bold mt-1 text-green-600">{healthyCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            {((healthyCount / totalAnimals) * 100).toFixed(1)}% of total livestock
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sick</p>
          <h3 className="text-2xl font-bold mt-1 text-red-600">{sickCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            {((sickCount / totalAnimals) * 100).toFixed(1)}% of total livestock
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Quarantined</p>
          <h3 className="text-2xl font-bold mt-1 text-yellow-600">{quarantinedCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            {((quarantinedCount / totalAnimals) * 100).toFixed(1)}% of total livestock
          </p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Livestock Type
            </label>
            <select
              id="type-filter"
              className="input w-full"
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
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Health Status
            </label>
            <select
              id="status-filter"
              className="input w-full"
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
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              className="input w-full"
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
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by breed, ID or notes..."
              className="input w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Livestock Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type/Breed
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acquisition Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Health Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.healthStatus === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.healthStatus === 'sick' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {item.healthStatus.charAt(0).toUpperCase() + item.healthStatus.slice(1)}
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
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
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, i) => (
                    <button
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
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Livestock Modal */}
      <AddLivestockModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        farmId={farmId}
        onSuccess={async () => {
          // Refresh livestock list after successful creation
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-2">Delete Livestock</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
