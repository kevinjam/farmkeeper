'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

const LocationSelector = dynamic(
  () => import('@/components/LocationSelector').then((m) => m.LocationSelector),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading map tools…
      </div>
    ),
  }
);

type FarmLocation = {
  address?: string;
  district?: string;
  country?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
};

function hasSetLocation(location?: FarmLocation | null): boolean {
  const lat = location?.coordinates?.latitude;
  const lng = location?.coordinates?.longitude;
  const hasCoords =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng);
  const hasAddress = Boolean(location?.address?.trim() || location?.district?.trim());
  return hasCoords || hasAddress;
}

function dismissKey(farmId: string) {
  return `farm-location-prompt-dismissed:${farmId}`;
}

interface FarmLocationPromptProps {
  farmId: string;
}

export default function FarmLocationPrompt({ farmId }: FarmLocationPromptProps) {
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<'ask' | 'manual'>('ask');
  const [country, setCountry] = useState('Uganda');
  const [draft, setDraft] = useState<FarmLocation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      setChecking(true);
      try {
        if (typeof window !== 'undefined' && localStorage.getItem(dismissKey(farmId)) === '1') {
          if (!cancelled) setVisible(false);
          return;
        }

        const response = await apiClient.getFarmSettings(farmId);
        if (!response.success) return;

        const location = (response.data as { location?: FarmLocation })?.location;
        if (cancelled) return;

        setCountry(location?.country || 'Uganda');
        setDraft(location || { country: 'Uganda' });
        setVisible(!hasSetLocation(location));
      } catch {
        // Fail quiet — don't block the dashboard
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    if (farmId) check();
    return () => {
      cancelled = true;
    };
  }, [farmId]);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(dismissKey(farmId), '1');
    }
    setVisible(false);
  };

  const saveLocation = useCallback(
    async (location: FarmLocation) => {
      setIsSaving(true);
      setError('');
      try {
        const response = await apiClient.updateFarmSettings(farmId, { location });
        if (!response.success) {
          throw new Error(response.error || 'Could not save location');
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem(dismissKey(farmId));
        }
        setSuccessMessage('Farm location saved');
        setTimeout(() => setVisible(false), 900);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save location');
      } finally {
        setIsSaving(false);
      }
    },
    [farmId]
  );

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return {
        address: (data.locality || data.city || '') as string,
        district: (data.principalSubdivision || data.city || '') as string,
        country: (data.countryName || country) as string,
        coordinates: { latitude: lat, longitude: lng },
      } satisfies FarmLocation;
    } catch {
      return {
        country,
        coordinates: { latitude: lat, longitude: lng },
      } satisfies FarmLocation;
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported in this browser. Enter your address instead.');
      setMode('manual');
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = await reverseGeocode(latitude, longitude);
        setDraft(location);
        await saveLocation(location);
        setIsLocating(false);
      },
      (geoError) => {
        setIsLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Location access denied. Enable permissions or enter your address.');
        } else {
          setError('Could not get your location. Enter your address instead.');
        }
        setMode('manual');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleManualSave = async () => {
    if (!draft || !hasSetLocation(draft)) {
      setError('Add an address or pick a nearby city before saving.');
      return;
    }
    await saveLocation({
      ...draft,
      country: draft.country || country,
    });
  };

  if (checking || !visible) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-white shadow-md dark:border-sky-900/50 dark:from-sky-950/40 dark:via-gray-900 dark:to-gray-900 max-md:rounded-2xl">
      <div className="relative px-4 py-5 sm:px-5 sm:py-6">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              Is your farm at your current location?
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Set your farm location so weather and local tips stay accurate.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {successMessage}
          </div>
        )}

        {mode === 'ask' ? (
          <div className="mt-5 space-y-3">
            <Button
              type="button"
              className="h-12 w-full gap-2 rounded-xl text-base font-semibold"
              onClick={handleUseCurrentLocation}
              disabled={isLocating || isSaving}
            >
              {isLocating || isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLocating ? 'Getting location…' : 'Saving…'}
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Use Current Location
                </>
              )}
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white px-3 text-gray-500 dark:bg-gray-900 dark:text-gray-400">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-xl text-base font-semibold"
              onClick={() => {
                setError('');
                setMode('manual');
              }}
              disabled={isLocating || isSaving}
            >
              Enter Address Manually
            </Button>

            <button
              type="button"
              onClick={dismiss}
              className="block w-full pt-1 text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Ask me later
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <LocationSelector
              initialLocation={{
                country: draft?.country || country,
                address: draft?.address,
                district: draft?.district,
                coordinates:
                  draft?.coordinates?.latitude != null && draft?.coordinates?.longitude != null
                    ? {
                        latitude: draft.coordinates.latitude,
                        longitude: draft.coordinates.longitude,
                      }
                    : undefined,
              }}
              onLocationChange={(location) => setDraft(location)}
              required
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                onClick={() => {
                  setMode('ask');
                  setError('');
                }}
                disabled={isSaving}
              >
                Back
              </Button>
              <Button
                type="button"
                className="h-11 flex-1 rounded-xl"
                onClick={handleManualSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save location'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
