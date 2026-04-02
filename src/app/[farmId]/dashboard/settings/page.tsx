'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Settings } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { apiClient } from '@/lib/api';
import { LocationSelector } from '@/components/LocationSelector';
import { LanguageSelector } from '@/components/LanguageSelector';

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
  const { t, raw } = useTranslations('common');
  
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
        
        const response = await apiClient.getFarmSettings(farmSlug);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch farm settings');
        }
        
        setSettings(response.data);
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
      
      const response = await apiClient.updateFarmSettings(farmSlug, {
        name: settings.name,
        location: settings.location,
        settings: settings.settings
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update farm settings');
      }
      
      setSuccess(t('settings.settingsUpdated'));
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(t('settings.settingsError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] space-y-6">
        {/* Loading Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80 animate-pulse"></div>
        </div>

        {/* Loading Farm Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Location Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-6 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-4 animate-pulse"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        </div>

        {/* Loading General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Save Button */}
        <div className="flex justify-end">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>

        {/* Loading Indicator */}
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">{t('settings.loadingSettings')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-md:mx-3 max-md:rounded-2xl bg-red-50 p-4 dark:bg-red-900/30 md:rounded-md">
        <p className="text-sm font-medium text-red-600 dark:text-red-200">{t('settings.settingsLoadError')}</p>
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base max-md:min-h-12 max-md:rounded-xl max-md:text-base [font-size:16px]';

  return (
    <div className="mx-auto w-full max-w-4xl max-md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <div className="mb-6 overflow-hidden bg-white shadow-md dark:bg-gray-800 max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-lg dark:max-md:border-gray-700/80 md:rounded-xl md:shadow-lg">
        <div className="flex max-md:items-start max-md:gap-3 max-md:bg-gradient-to-br max-md:from-slate-500/10 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-slate-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-500/15 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200 md:hidden">
            <Settings className="h-6 w-6" strokeWidth={2} />
          </div>
          <div className="min-w-0 md:pl-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl md:text-3xl">{t('settings.title')}</h1>
            <p className="mt-1 text-[13px] leading-snug text-gray-600 dark:text-gray-400 sm:mt-2 sm:text-base">
              {t('settings.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40 sm:mb-6 mx-4 sm:mx-0 md:rounded-lg">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30 sm:mb-6 mx-4 sm:mx-0 md:rounded-lg">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-0">
        <div className="max-md:mx-0 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-md dark:max-md:border-gray-700/80 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 md:border-0 md:shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('settings.farmInformation')}</h2>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.farmName')}
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev!, name: e.target.value }))}
                className={inputClass}
                placeholder={t('settings.farmNamePlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.farmUrl')}
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-gray-500 dark:text-gray-400 mb-2 sm:mb-0 sm:mr-2 text-sm sm:text-base">farmkeeper.app/</span>
                <input
                  type="text"
                  value={settings.slug}
                  onChange={(e) => setSettings(prev => ({ ...prev!, slug: e.target.value }))}
                  className={`flex-1 ${inputClass}`}
                  placeholder="your-farm-name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Settings */}
        <div className="max-md:mx-0 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-md dark:max-md:border-gray-700/80 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 md:border-0 md:shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('settings.locationSettings')}</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            {t('settings.locationDescription')}
          </p>
          
          <LocationSelector
            initialLocation={settings.location}
            onLocationChange={handleLocationChange}
            required={false}
          />

          {/* Troubleshooting Section */}
          <div className="mt-4 sm:mt-6 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4 dark:border-gray-600 dark:bg-gray-700/80">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">{t('settings.locationTroubleshooting')}</h3>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1 sm:space-y-2">
              <p><strong>{t('settings.locationTroubleshootingTitle')}</strong></p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-1">
                {(raw('settings.locationTroubleshootingTips') as string[] || []).map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
              <p className="mt-2 sm:mt-3"><strong>{t('settings.commonUgandaCoordinates')}</strong></p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-1">
                {(raw('settings.ugandaCoordinates') as string[] || []).map((coord: string, index: number) => (
                  <li key={index}>{coord}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="max-md:mx-0 max-md:rounded-2xl max-md:border max-md:border-gray-200/90 max-md:shadow-md dark:max-md:border-gray-700/80 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 md:border-0 md:shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('settings.generalSettings')}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.currency')}
              </label>
              <select
                value={settings.settings.currency}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  settings: { ...prev!.settings, currency: e.target.value }
                }))}
                className={inputClass}
              >
                <option value="UGX">{t('currencies.UGX')}</option>
                <option value="USD">{t('currencies.USD')}</option>
                <option value="EUR">{t('currencies.EUR')}</option>
              </select>
            </div>
            
            <LanguageSelector />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.timezone')}
              </label>
              <select
                value={settings.settings.timezone}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  settings: { ...prev!.settings, timezone: e.target.value }
                }))}
                className={inputClass}
              >
                <option value="Africa/Kampala">{t('timezones.Africa/Kampala')}</option>
                <option value="Africa/Nairobi">{t('timezones.Africa/Nairobi')}</option>
                <option value="Africa/Dar_es_Salaam">{t('timezones.Africa/Dar_es_Salaam')}</option>
              </select>
            </div>
            
            <div className="flex items-center sm:items-start pt-2">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.settings.notificationsEnabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  settings: { ...prev!.settings, notificationsEnabled: e.target.checked }
                }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="notifications" className="ml-3 block text-sm sm:text-base text-gray-700 dark:text-gray-300">
                {t('settings.notificationsEnabled')}
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 px-4 sm:px-0 max-md:pb-2">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 max-md:min-h-12 max-md:rounded-xl bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base transition-colors duration-200"
          >
            {isSaving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('settings.saving')}
              </span>
            ) : (
              t('settings.saveSettings')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}