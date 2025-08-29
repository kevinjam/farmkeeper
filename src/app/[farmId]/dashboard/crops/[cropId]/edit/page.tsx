'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Crop {
  _id: string;
  name: string;
  cropType: string;
  variety?: string;
  area: number;
  areaUnit: string;
  status: string;
  plantedDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  yield?: number;
  yieldUnit?: string;
  location?: string;
  notes?: string;
}

export default function EditCrop({ params }: { params: { farmId: string; cropId: string } }) {
  const { farmId, cropId } = params;
  const router = useRouter();
  
  // Form state
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('');
  const [variety, setVariety] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [status, setStatus] = useState('planned');
  const [plantedDate, setPlantedDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [actualHarvestDate, setActualHarvestDate] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldUnit, setYieldUnit] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const cropTypes = [
    { value: 'cereals', label: 'Cereals' },
    { value: 'legumes', label: 'Legumes' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'root_crops', label: 'Root Crops' },
    { value: 'cash_crops', label: 'Cash Crops' },
    { value: 'fodder', label: 'Fodder' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'planned', label: 'Planned' },
    { value: 'planted', label: 'Planted' },
    { value: 'growing', label: 'Growing' },
    { value: 'harvested', label: 'Harvested' },
    { value: 'failed', label: 'Failed' }
  ];

  const yieldUnits = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'tons', label: 'Tons' },
    { value: 'lbs', label: 'Pounds (lbs)' },
    { value: 'bushels', label: 'Bushels' },
    { value: 'bags', label: 'Bags' },
    { value: 'units', label: 'Units' }
  ];

  const fetchCrop = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/farms/${farmId}/crops/${cropId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        const crop: Crop = result.data;
        
        // Populate form with existing data
        setName(crop.name);
        setCropType(crop.cropType);
        setVariety(crop.variety || '');
        setArea(crop.area.toString());
        setAreaUnit(crop.areaUnit);
        setStatus(crop.status);
        setPlantedDate(crop.plantedDate ? crop.plantedDate.split('T')[0] : '');
        setExpectedHarvestDate(crop.expectedHarvestDate ? crop.expectedHarvestDate.split('T')[0] : '');
        setActualHarvestDate(crop.actualHarvestDate ? crop.actualHarvestDate.split('T')[0] : '');
        setYieldAmount(crop.yield ? crop.yield.toString() : '');
        setYieldUnit(crop.yieldUnit || '');
        setLocation(crop.location || '');
        setNotes(crop.notes || '');
        setError('');
      } else if (response.status === 404) {
        setError('Crop not found');
      } else {
        setError('Failed to fetch crop details');
      }
    } catch (err) {
      console.error('Error fetching crop:', err);
      setError('Failed to fetch crop details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const cropData = {
        name: name.trim(),
        cropType,
        variety: variety.trim() || undefined,
        area: parseFloat(area),
        areaUnit,
        status,
        plantedDate: plantedDate || undefined,
        expectedHarvestDate: expectedHarvestDate || undefined,
        actualHarvestDate: actualHarvestDate || undefined,
        yield: yieldAmount ? parseFloat(yieldAmount) : undefined,
        yieldUnit: yieldUnit || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined
      };

      const response = await fetch(`/api/farms/${farmId}/crops/${cropId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cropData),
      });

      if (response.ok) {
        router.push(`/${farmId}/dashboard/crops/${cropId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update crop. Please try again.');
      }
    } catch (err) {
      console.error('Error updating crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to update crop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCrop();
  }, [farmId, cropId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <div className="mt-4">
            <Link 
              href={`/${farmId}/dashboard/crops`}
              className="underline hover:no-underline mr-4"
            >
              Back to Crops
            </Link>
            <button 
              onClick={fetchCrop}
              className="underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href={`/${farmId}/dashboard/crops/${cropId}`}
          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium mb-2 inline-block"
        >
          ← Back to Crop Details
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Crop</h1>
        <p className="text-gray-600 dark:text-gray-400">Update the details for this crop.</p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Error Message */}
        {error && (
          <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400">
            <div className="text-red-700 dark:text-red-400 text-sm">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crop Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Crop Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Maize, Tomatoes, Beans"
              />
            </div>

            {/* Crop Type */}
            <div>
              <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Crop Type *
              </label>
              <select
                id="cropType"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select crop type</option>
                {cropTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Variety */}
            <div>
              <label htmlFor="variety" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Variety
              </label>
              <input
                type="text"
                id="variety"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Hybrid, Local variety"
              />
            </div>

            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area *
              </label>
              <input
                type="number"
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.0"
              />
            </div>

            {/* Area Unit */}
            <div>
              <label htmlFor="areaUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area Unit
              </label>
              <select
                id="areaUnit"
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Planted Date */}
            <div>
              <label htmlFor="plantedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Planted Date
              </label>
              <input
                type="date"
                id="plantedDate"
                value={plantedDate}
                onChange={(e) => setPlantedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Expected Harvest Date */}
            <div>
              <label htmlFor="expectedHarvestDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Harvest Date
              </label>
              <input
                type="date"
                id="expectedHarvestDate"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Actual Harvest Date */}
            <div>
              <label htmlFor="actualHarvestDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Actual Harvest Date
              </label>
              <input
                type="date"
                id="actualHarvestDate"
                value={actualHarvestDate}
                onChange={(e) => setActualHarvestDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Yield */}
            <div>
              <label htmlFor="yield" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Yield
              </label>
              <input
                type="number"
                id="yield"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.0"
              />
            </div>

            {/* Yield Unit */}
            <div>
              <label htmlFor="yieldUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Yield Unit
              </label>
              <select
                id="yieldUnit"
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select unit</option>
                {yieldUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location/Field
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., North Field, Block A"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Additional notes about this crop..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/${farmId}/dashboard/crops/${cropId}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!name || !cropType || !area || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Crop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
