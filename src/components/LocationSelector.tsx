'use client';

import { useState, useEffect, useRef } from 'react';
import {
  SUPPORTED_COUNTRIES,
  getCountryByCode,
  getLocationPlaceholders,
  getLocationPresets,
  normalizeCountryCode,
  type LocationPreset,
} from '@/lib/countries';

interface LocationData {
  address?: string;
  district?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationSelectorProps {
  initialLocation?: LocationData;
  onLocationChange: (location: LocationData) => void;
  required?: boolean;
  className?: string;
}

export function LocationSelector({
  initialLocation,
  onLocationChange,
  required = false,
  className = '',
}: LocationSelectorProps) {
  const defaultCountry = getCountryByCode('UG').name;
  const [location, setLocation] = useState<LocationData>(
    initialLocation?.country ? initialLocation : { country: defaultCountry }
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const isInitialMount = useRef(true);
  const countryCode = normalizeCountryCode(location.country);
  const presets = getLocationPresets(countryCode);
  const placeholders = getLocationPlaceholders(countryCode);

  // Sync when parent passes country from URL (e.g. ?country=KE)
  useEffect(() => {
    if (!initialLocation?.country) return;
    const nextCode = normalizeCountryCode(initialLocation.country);
    const currentCode = normalizeCountryCode(location.country);
    if (nextCode !== currentCode) {
      setLocation((prev) => ({
        ...prev,
        country: getCountryByCode(nextCode).name,
      }));
    }
  }, [initialLocation?.country, location.country]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onLocationChange(location);
  }, [location, onLocationChange]);

  const applyPreset = (preset: LocationPreset) => {
    setLocation({
      address: preset.address,
      district: preset.district,
      country: preset.country,
      coordinates: { ...preset.coordinates },
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setManualMode(true);
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    const options = [
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 600000 },
    ];

    const tryGetLocation = (optionIndex = 0) => {
      if (optionIndex >= options.length) {
        setIsGettingLocation(false);
        setLocationError('Unable to get your location. Please enter it manually.');
        setManualMode(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (latitude === 0 && longitude === 0) {
            tryGetLocation(optionIndex + 1);
            return;
          }
          setLocation((prev) => ({
            ...prev,
            coordinates: { latitude, longitude },
          }));
          setIsGettingLocation(false);
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          if (optionIndex < options.length - 1) {
            setTimeout(() => tryGetLocation(optionIndex + 1), 1000);
            return;
          }
          setIsGettingLocation(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Location access denied. Enable permissions or enter manually.');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Location unavailable. Please enter your farm location manually.');
              break;
            case error.TIMEOUT:
              setLocationError('Location request timed out. Please enter manually.');
              break;
            default:
              setLocationError('Could not detect location. Please enter manually.');
          }
          setManualMode(true);
        },
        options[optionIndex]
      );
    };

    tryGetLocation();
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();

      if (data.city || data.locality || data.countryName) {
        setLocation((prev) => ({
          ...prev,
          address: data.locality || data.city || prev.address,
          district: data.principalSubdivision || data.city || prev.district,
          country: data.countryName || prev.country,
        }));
      }
    } catch {
      // Non-fatal — coordinates are still saved
    }
  };

  const handleInputChange = (field: keyof LocationData, value: string) => {
    setLocation((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setLocation((prev) => {
        const latitude = field === 'latitude' ? numValue : prev.coordinates?.latitude;
        const longitude = field === 'longitude' ? numValue : prev.coordinates?.longitude;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          return {
            ...prev,
            coordinates:
              field === 'latitude'
                ? { latitude: numValue, longitude: prev.coordinates?.longitude ?? 0 }
                : { latitude: prev.coordinates?.latitude ?? 0, longitude: numValue },
          };
        }
        return {
          ...prev,
          coordinates: { latitude, longitude },
        };
      });
    }
  };

  const lat = location.coordinates?.latitude;
  const lng = location.coordinates?.longitude;
  const hasValidCoordinates =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Farm Location {required && <span className="text-red-500">*</span>}
        </label>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Country
          </label>
          <select
            value={countryCode}
            onChange={(e) => {
              const country = getCountryByCode(e.target.value);
              setLocation((prev) => ({
                ...prev,
                country: country.name,
                address: '',
                district: '',
                coordinates: undefined,
              }));
            }}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGettingLocation ? 'Getting location…' : 'Use current location'}
          </button>

          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className="rounded-md bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
          >
            {manualMode ? 'Hide manual entry' : 'Enter manually'}
          </button>

          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong>{' '}
            {presets.length > 0
              ? `Use your current location, pick a nearby city, or enter your farm address in ${getCountryByCode(countryCode).name}.`
              : `Enter your farm address in ${getCountryByCode(countryCode).name}, or use current location if available.`}
          </p>
        </div>

        {locationError && (
          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{locationError}</p>
          </div>
        )}
      </div>

      {manualMode && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address / area
              </label>
              <input
                type="text"
                value={location.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={placeholders.address}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Region / district
              </label>
              <input
                type="text"
                value={location.district || ''}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder={placeholders.district}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={location.coordinates?.latitude ?? ''}
                onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                placeholder="e.g., -1.2921"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={location.coordinates?.longitude ?? ''}
                onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                placeholder="e.g., 36.8219"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {(hasValidCoordinates || location.address || location.district) && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Location set:</strong>{' '}
            {location.address && `${location.address}, `}
            {location.district && `${location.district}, `}
            {location.country}
            {hasValidCoordinates && (
              <span className="mt-1 block text-xs">
                {lat!.toFixed(4)}, {lng!.toFixed(4)}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
