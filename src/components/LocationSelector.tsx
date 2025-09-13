'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  className = ''
}: LocationSelectorProps) {
  const [location, setLocation] = useState<LocationData>(
    initialLocation || { country: 'Uganda' }
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const isInitialMount = useRef(true);

  // Update parent when location changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onLocationChange(location);
  }, [location, onLocationChange]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setManualMode(true);
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    // Try with different options for better compatibility
    const options = [
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Don't use cached location
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 300000 // 5 minutes
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 600000 // 10 minutes
      }
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
          
          // Validate coordinates
          if (latitude === 0 && longitude === 0) {
            console.warn('Received invalid coordinates (0,0), trying next option...');
            tryGetLocation(optionIndex + 1);
            return;
          }

          setLocation(prev => ({
            ...prev,
            coordinates: { latitude, longitude }
          }));
          setIsGettingLocation(false);
          
          // Try to reverse geocode to get address
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.warn(`Location attempt ${optionIndex + 1} failed:`, error);
          
          // Try next option if available
          if (optionIndex < options.length - 1) {
            setTimeout(() => tryGetLocation(optionIndex + 1), 1000);
            return;
          }

          // All options failed
          setIsGettingLocation(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Location access denied. Please enable location permissions in your browser settings or enter manually.');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Location information unavailable. This might be due to network issues or device settings. Please enter manually.');
              break;
            case error.TIMEOUT:
              setLocationError('Location request timed out. Please check your internet connection or enter manually.');
              break;
            default:
              setLocationError(`Location error (${error.code}): ${error.message || 'Unknown error'}. Please enter manually.`);
              break;
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
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.city || data.locality) {
        setLocation(prev => ({
          ...prev,
          address: data.locality || data.city,
          district: data.principalSubdivision || data.city
        }));
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }
  };

  const handleInputChange = (field: keyof LocationData, value: string) => {
    setLocation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setLocation(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [field]: numValue
        } as { latitude: number; longitude: number }
      }));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Farm Location {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Auto-detect or Manual toggle */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGettingLocation ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Location...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use Current Location
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            {manualMode ? 'Hide Manual Entry' : 'Enter Manually'}
          </button>

          <button
            type="button"
            onClick={() => {
              setLocation(prev => ({
                ...prev,
                address: 'Kampala',
                district: 'Kampala',
                country: 'Uganda',
                coordinates: { latitude: 0.3476, longitude: 32.5825 }
              }));
            }}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Use Kampala
          </button>

          <button
            type="button"
            onClick={() => {
              setLocation(prev => ({
                ...prev,
                address: 'Entebbe',
                district: 'Wakiso',
                country: 'Uganda',
                coordinates: { latitude: 0.0644, longitude: 32.4465 }
              }));
            }}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Use Entebbe
          </button>

          <button
            type="button"
            onClick={() => {
              setLocation(prev => ({
                ...prev,
                address: 'Jinja',
                district: 'Jinja',
                country: 'Uganda',
                coordinates: { latitude: 0.4244, longitude: 33.2042 }
              }));
            }}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Use Jinja
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> If location detection fails, you can manually enter your coordinates or use the Kampala default. 
            Make sure location permissions are enabled in your browser settings.
          </p>
        </div>

        {locationError && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{locationError}</p>
          </div>
        )}
      </div>

      {/* Manual entry fields */}
      {manualMode && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address/Village
              </label>
              <input
                type="text"
                value={location.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., Ntinda, Kampala"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                District
              </label>
              <input
                type="text"
                value={location.district || ''}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder="e.g., Kampala"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <input
              type="text"
              value={location.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={location.coordinates?.latitude || ''}
                onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                placeholder="e.g., 0.3476"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={location.coordinates?.longitude || ''}
                onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                placeholder="e.g., 32.5825"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Display current location info */}
      {location.coordinates && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Location Set:</strong> {location.address && `${location.address}, `}
            {location.district && `${location.district}, `}
            {location.country}
            {location.coordinates && (
              <span className="block text-xs mt-1">
                Coordinates: {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
