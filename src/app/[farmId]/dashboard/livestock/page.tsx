'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Define type for livestock data
type Livestock = {
  id: string;
  type: string;
  breed: string;
  quantity: number;
  acquisitionDate: string;
  status: 'healthy' | 'sick' | 'quarantined';
  notes: string;
  lastUpdated: string;
};

// Define types for filter and sort options
type FilterOption = {
  label: string;
  value: string;
};

// Define livestock type options for Ugandan farmers
const livestockTypes: FilterOption[] = [
  { label: 'All Types', value: 'all' },
  { label: 'Chicken - Layers', value: 'chicken-layers' },
  { label: 'Chicken - Broilers', value: 'chicken-broilers' },
  { label: 'Cattle - Dairy', value: 'cattle-dairy' },
  { label: 'Cattle - Beef', value: 'cattle-beef' },
  { label: 'Goats', value: 'goats' },
  { label: 'Sheep', value: 'sheep' },
  { label: 'Pigs', value: 'pigs' },
  { label: 'Fish', value: 'fish' },
];

// Define status options
const statusOptions: FilterOption[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Healthy', value: 'healthy' },
  { label: 'Sick', value: 'sick' },
  { label: 'Quarantined', value: 'quarantined' },
];

// Define sort options
const sortOptions: FilterOption[] = [
  { label: 'Date Added (Newest)', value: 'date-desc' },
  { label: 'Date Added (Oldest)', value: 'date-asc' },
  { label: 'Quantity (Highest)', value: 'quantity-desc' },
  { label: 'Quantity (Lowest)', value: 'quantity-asc' },
];

export default function LivestockPage({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  
  // State for livestock data
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  
  // State for filters and sorting
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // State for loading and error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch livestock data
  useEffect(() => {
    // In a real app, this would be an API call like:
    // fetch(`/api/${farmId}/livestock`)
    //   .then(response => response.json())
    //   .then(data => {
    //     setLivestock(data);
    //     setIsLoading(false);
    //   })
    //   .catch(err => {
    //     setError('Failed to load livestock data');
    //     setIsLoading(false);
    //   });
    
    // For demonstration, we'll use mock data
    setTimeout(() => {
      const mockLivestock: Livestock[] = [
        {
          id: 'ls-001',
          type: 'chicken-layers',
          breed: 'Rhode Island Red',
          quantity: 150,
          acquisitionDate: '2025-01-15',
          status: 'healthy',
          notes: 'Batch from Central Hatchery. Vaccinated on arrival.',
          lastUpdated: '2025-07-01'
        },
        {
          id: 'ls-002',
          type: 'chicken-broilers',
          breed: 'Cobb 500',
          quantity: 200,
          acquisitionDate: '2025-03-20',
          status: 'healthy',
          notes: 'Growing well. Ready for market in 3 weeks.',
          lastUpdated: '2025-07-02'
        },
        {
          id: 'ls-003',
          type: 'cattle-dairy',
          breed: 'Holstein Friesian',
          quantity: 5,
          acquisitionDate: '2024-11-10',
          status: 'healthy',
          notes: 'Producing an average of 15L per cow per day.',
          lastUpdated: '2025-07-03'
        },
        {
          id: 'ls-004',
          type: 'goats',
          breed: 'Boer',
          quantity: 12,
          acquisitionDate: '2025-02-05',
          status: 'healthy',
          notes: 'Breeding stock. 3 females pregnant.',
          lastUpdated: '2025-07-01'
        },
        {
          id: 'ls-005',
          type: 'chicken-layers',
          breed: 'White Leghorn',
          quantity: 100,
          acquisitionDate: '2025-04-15',
          status: 'quarantined',
          notes: 'Showing signs of respiratory issues. Under medication.',
          lastUpdated: '2025-07-04'
        },
        {
          id: 'ls-006',
          type: 'pigs',
          breed: 'Large White',
          quantity: 8,
          acquisitionDate: '2025-01-30',
          status: 'healthy',
          notes: '2 sows with piglets. Rest are growers.',
          lastUpdated: '2025-07-02'
        },
        {
          id: 'ls-007',
          type: 'cattle-beef',
          breed: 'Ankole',
          quantity: 10,
          acquisitionDate: '2024-12-20',
          status: 'healthy',
          notes: 'Local breed. Good adaptation to climate.',
          lastUpdated: '2025-07-01'
        },
        {
          id: 'ls-008',
          type: 'fish',
          breed: 'Tilapia',
          quantity: 500,
          acquisitionDate: '2025-05-01',
          status: 'healthy',
          notes: 'Stocked in main pond. Expected harvest in September.',
          lastUpdated: '2025-07-03'
        },
        {
          id: 'ls-009',
          type: 'sheep',
          breed: 'Dorper',
          quantity: 15,
          acquisitionDate: '2025-02-15',
          status: 'sick',
          notes: 'Some showing symptoms of worms. Deworming scheduled.',
          lastUpdated: '2025-07-05'
        },
        {
          id: 'ls-010',
          type: 'chicken-broilers',
          breed: 'Ross 308',
          quantity: 150,
          acquisitionDate: '2025-06-01',
          status: 'healthy',
          notes: 'New batch. 2 weeks old.',
          lastUpdated: '2025-07-04'
        },
        {
          id: 'ls-011',
          type: 'cattle-dairy',
          breed: 'Jersey',
          quantity: 3,
          acquisitionDate: '2025-03-15',
          status: 'healthy',
          notes: 'High butterfat content milk producers.',
          lastUpdated: '2025-07-02'
        },
        {
          id: 'ls-012',
          type: 'pigs',
          breed: 'Landrace',
          quantity: 6,
          acquisitionDate: '2025-04-10',
          status: 'quarantined',
          notes: 'Recently purchased. Under observation period.',
          lastUpdated: '2025-07-05'
        }
      ];
      
      setLivestock(mockLivestock);
      setIsLoading(false);
    }, 1000);
  }, [farmId]);
  
  // Filter and sort livestock data
  const filteredAndSortedLivestock = livestock
    // Filter by type
    .filter(item => selectedType === 'all' || item.type === selectedType)
    // Filter by status
    .filter(item => selectedStatus === 'all' || item.status === selectedStatus)
    // Filter by search query
    .filter(item => 
      item.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Sort by selected option
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime();
        case 'date-asc':
          return new Date(a.acquisitionDate).getTime() - new Date(b.acquisitionDate).getTime();
        case 'quantity-desc':
          return b.quantity - a.quantity;
        case 'quantity-asc':
          return a.quantity - b.quantity;
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

  // Calculate total livestock counts
  const totalCount = livestock.reduce((sum, item) => sum + item.quantity, 0);
  const healthyCount = livestock
    .filter(item => item.status === 'healthy')
    .reduce((sum, item) => sum + item.quantity, 0);
  const sickCount = livestock
    .filter(item => item.status === 'sick')
    .reduce((sum, item) => sum + item.quantity, 0);
  const quarantinedCount = livestock
    .filter(item => item.status === 'quarantined')
    .reduce((sum, item) => sum + item.quantity, 0);

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
          <h3 className="text-2xl font-bold mt-1">{totalCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            Across {livestock.length} different groups
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Healthy</p>
          <h3 className="text-2xl font-bold mt-1 text-green-600">{healthyCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            {((healthyCount / totalCount) * 100).toFixed(1)}% of total livestock
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sick</p>
          <h3 className="text-2xl font-bold mt-1 text-red-600">{sickCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            {((sickCount / totalCount) * 100).toFixed(1)}% of total livestock
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Quarantined</p>
          <h3 className="text-2xl font-bold mt-1 text-yellow-600">{quarantinedCount}</h3>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
            {((quarantinedCount / totalCount) * 100).toFixed(1)}% of total livestock
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
                  Quantity
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
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>{getLivestockTypeLabel(item.type)}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{item.breed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.acquisitionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.status === 'sick' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.lastUpdated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/${farmId}/dashboard/livestock/${item.id}`}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/${farmId}/dashboard/livestock/${item.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No livestock records found. Try adjusting your filters or{' '}
                    <Link 
                      href={`/${farmId}/dashboard/livestock/add`}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      add new livestock
                    </Link>.
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
    </div>
  );
}
