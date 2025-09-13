'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { LocationSelector } from '@/components/LocationSelector';

interface FarmSettings {
  name: string;
  slug: string;
  location: {
    address?: string;
    district?: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  settings: {
    currency: string;
    language: string;
    timezone: string;
    notificationsEnabled: boolean;
  };
}

export default function FarmSettingsPage() {
  const params = useParams();
  const farmSlug = params.farmId as string;
  
  const [settings, setSettings] = useState<FarmSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch farm settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // For now, we'll create a mock settings object
        // In a real app, you'd have an API endpoint for this
        const mockSettings: FarmSettings = {
          name: 'My Farm',
          slug: farmSlug,
          location: {
            country: 'Uganda'
          },
          settings: {
            currency: 'UGX',
            language: 'en',
            timezone: 'Africa/Kampala',
            notificationsEnabled: true
          }
        };
        
        setSettings(mockSettings);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load farm settings');
      } finally {
        setIsLoading(false);
      }
    };

    if (farmSlug) {
      fetchSettings();
    }
  }, [farmSlug]);

  const handleLocationChange = useCallback((location: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        location
      };
    });
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      
      // For now, we'll just show a success message
      // In a real app, you'd call an API to update the farm settings
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Farm settings updated successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save farm settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
        <p className="text-red-600 dark:text-red-200">Failed to load farm settings</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Farm Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your farm information and preferences
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <p className="text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Farm Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Farm Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Farm Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev!, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Farm URL
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 mr-2">farmkeeper.app/</span>
                <input
                  type="text"
                  value={settings.slug}
                  onChange={(e) => setSettings(prev => ({ ...prev!, slug: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Location Settings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Set your farm's location to enable weather forecasts and local farming recommendations.
          </p>
          
          <LocationSelector
            initialLocation={settings.location}
            onLocationChange={handleLocationChange}
            required={false}
          />

          {/* Troubleshooting Section */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Location Troubleshooting</h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <p><strong>If "Use Current Location" fails:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Check that location permissions are enabled in your browser</li>
                <li>Make sure you're using HTTPS (required for geolocation)</li>
                <li>Try refreshing the page and allowing location access</li>
                <li>Use one of the preset Uganda locations as a fallback</li>
                <li>Manually enter your coordinates if you know them</li>
              </ul>
              <p className="mt-2"><strong>Common Uganda coordinates:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Kampala: 0.3476°N, 32.5825°E</li>
                <li>Entebbe: 0.0644°N, 32.4465°E</li>
                <li>Jinja: 0.4244°N, 33.2042°E</li>
              </ul>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">General Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                value={settings.settings.currency}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  settings: { ...prev!.settings, currency: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="UGX">Ugandan Shilling (UGX)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
              </label>
              <select
                value={settings.settings.language}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  settings: { ...prev!.settings, language: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
                <option value="lg">Luganda</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timezone
              </label>
              <select
                value={settings.settings.timezone}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  settings: { ...prev!.settings, timezone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (EAT)</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.settings.notificationsEnabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  settings: { ...prev!.settings, notificationsEnabled: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable notifications
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}