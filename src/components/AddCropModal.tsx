'use client';

import { useState } from 'react';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  onSuccess: () => void;
}

export default function AddCropModal({ isOpen, onClose, farmId, onSuccess }: AddCropModalProps) {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('');
  const [variety, setVariety] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('acres');
  const [status, setStatus] = useState('planned');
  const [plantedDate, setPlantedDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
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
        location: location.trim() || undefined,
        notes: notes.trim() || undefined
      };

      const response = await fetch(`/api/farms/${farmId}/crops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cropData),
      });

      if (response.ok) {
        handleCancel();
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create crop. Please try again.');
      }
    } catch (err) {
      console.error('Error creating crop:', err);
      setError(err instanceof Error ? err.message : 'Failed to create crop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setCropType('');
    setVariety('');
    setArea('');
    setAreaUnit('acres');
    setStatus('planned');
    setPlantedDate('');
    setExpectedHarvestDate('');
    setLocation('');
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New Crop
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter the details for your new crop. You can update these details later.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400">
            <div className="text-red-700 dark:text-red-400 text-sm">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Additional notes about this crop..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !cropType || !area || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Crop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
