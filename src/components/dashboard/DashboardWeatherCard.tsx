'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Droplets, MapPin, Wind } from 'lucide-react';
import { OpenMeteoWeatherIcon } from '@/components/OpenMeteoWeatherIcon';
import { apiClient } from '@/lib/api';
import { useFarmPaths } from '@/hooks/useFarmPaths';

type WeatherSnapshot = {
  temp_c: number;
  condition: string;
  humidity?: number;
  wind_kph?: number;
  weather_code?: number;
  location?: string;
  rainChance?: number;
};

export default function DashboardWeatherCard({ farmId }: { farmId: string }) {
  const { farmPath } = useFarmPaths(farmId);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const response = await apiClient.getWeather(farmId).catch(() => ({ success: false, data: null }));
      if (cancelled) return;

      if (response.success && response.data) {
        const data = response.data as {
          current?: {
            temp_c?: number;
            humidity?: number;
            wind_kph?: number;
            condition?: { text?: string };
          };
          hourly?: { weather_code?: number }[];
          location?: { name?: string };
          forecast?: { forecastday?: { day?: { daily_chance_of_rain?: number } }[] };
        };
        setWeather({
          temp_c: Number(data.current?.temp_c ?? 0),
          condition: data.current?.condition?.text || 'Current conditions',
          humidity: data.current?.humidity,
          wind_kph: data.current?.wind_kph,
          weather_code: data.hourly?.[0]?.weather_code,
          location: data.location?.name,
          rainChance: data.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain,
        });
      } else {
        setWeather(null);
      }
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [farmId]);

  return (
    <Link
      href={farmPath('/dashboard/weather')}
      className="flex min-h-[11rem] flex-1 flex-col overflow-hidden rounded-lg bg-gradient-to-br from-sky-50 to-white shadow dark:from-sky-950/50 dark:to-gray-800 max-md:rounded-2xl max-md:border max-md:border-sky-100/80 dark:max-md:border-sky-900/40"
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Farm weather</h3>
          <p className="flex items-center gap-1 text-[11px] text-gray-500">
            <MapPin className="h-3 w-3" />
            {loading ? 'Checking conditions…' : weather?.location || 'Set your farm location'}
          </p>
        </div>
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">View</span>
      </div>

      <div className="flex flex-1 items-center px-4 py-3">
        {loading ? (
          <div className="h-12 w-32 animate-pulse rounded-lg bg-sky-100/80 dark:bg-sky-900/40" />
        ) : weather ? (
          <div className="flex w-full items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-gray-900/50">
              {typeof weather.weather_code === 'number' ? (
                <OpenMeteoWeatherIcon weatherCode={weather.weather_code} size={28} />
              ) : (
                <Droplets className="h-6 w-6 text-sky-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-3xl font-bold tabular-nums leading-none text-gray-900 dark:text-white">
                {Math.round(weather.temp_c)}°
              </p>
              <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-300">{weather.condition}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-gray-500">
                {typeof weather.humidity === 'number' ? (
                  <span className="inline-flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {weather.humidity}%
                  </span>
                ) : null}
                {typeof weather.wind_kph === 'number' ? (
                  <span className="inline-flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {Math.round(weather.wind_kph)} km/h
                  </span>
                ) : null}
                {typeof weather.rainChance === 'number' ? <span>{weather.rainChance}% rain</span> : null}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
            Add a farm location to see today’s forecast.
          </p>
        )}
      </div>
    </Link>
  );
}
