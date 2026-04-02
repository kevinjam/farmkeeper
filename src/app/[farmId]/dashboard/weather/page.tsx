'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { OpenMeteoWeatherIcon } from '@/components/OpenMeteoWeatherIcon';
import { TemperatureChart } from '@/components/TemperatureChart';
import { TemperatureToggle } from '@/components/TemperatureToggle';
import { RefreshCw, MapPin, Droplets, Wind, Gauge, CloudSun } from 'lucide-react';
import { Button } from '@/components/ui/button';

type WeatherData = {
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    wind_mph: number;
    precip_mm: number;
    pressure_mb: number;
    feels_like_c: number;
    feels_like_f: number;
  };
  hourly: Array<{
    time: string;
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    precip_mm: number;
    weather_code: number;
  }>;
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        maxtemp_f: number;
        mintemp_f: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
        totalprecip_mm: number;
      };
    }>;
  };
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  suggestions: string[];
  timezone: string;
  last_updated: string;
};

type TemperatureUnit = 'celsius' | 'fahrenheit';

const shellCard =
  'overflow-hidden border border-gray-200/90 bg-white shadow-md dark:border-gray-700/80 dark:bg-gray-800 max-md:mx-3 max-md:rounded-2xl md:rounded-xl md:shadow-lg';

export default function WeatherPage({ params }: { params: { farmId: string } }) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiClient.getWeather(params.farmId);

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch weather data');
        }

        setWeatherData(response.data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.farmId) {
      fetchWeatherData();
    }
  }, [params.farmId]);

  const refreshWeather = () => {
    if (params.farmId) {
      setIsLoading(true);
      setError('');

      const fetchData = async () => {
        try {
          const response = await apiClient.getWeather(params.farmId);

          if (!response.success) {
            throw new Error(response.error || 'Failed to fetch weather data');
          }

          setWeatherData(response.data);
        } catch (err) {
          console.error('Weather refresh error:', err);
          setError(err instanceof Error ? err.message : 'Failed to refresh weather data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <div className="max-md:space-y-4 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:space-y-6">
        <div className={shellCard}>
          <div className="max-md:bg-gradient-to-br max-md:from-sky-500/12 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-sky-500/14 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700 md:hidden" />
                <div>
                  <div className="mb-2 h-7 w-44 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 md:h-8 md:w-48" />
                  <div className="h-4 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row md:items-center">
                <div className="h-11 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 md:h-10 md:w-28" />
                <div className="h-11 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 md:h-10 md:w-24" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 px-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:px-0">
          <div className="col-span-2 rounded-2xl bg-gradient-to-br from-blue-100/90 to-sky-50 p-4 dark:from-blue-900/40 dark:to-sky-900/20 md:col-span-1 lg:col-span-1 md:rounded-xl md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200/80 dark:bg-gray-600" />
              <div className="text-right">
                <div className="mb-2 h-10 w-20 animate-pulse rounded bg-gray-200/80 dark:bg-gray-600" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200/80 dark:bg-gray-600" />
              </div>
            </div>
            <div className="mx-auto h-6 w-32 animate-pulse rounded bg-gray-200/80 dark:bg-gray-600" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/80 md:rounded-xl md:p-6"
            >
              <div className="mb-3 flex items-center">
                <div className="mr-2 h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
              </div>
              <div className="h-9 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
            </div>
          ))}
        </div>

        <div className={`${shellCard} p-4 md:p-6`}>
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-56 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700 md:h-64" />
        </div>

        <div className="max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-primary-200/80 max-md:bg-primary-50/90 p-4 dark:border-primary-900/50 dark:bg-primary-950/30 md:rounded-xl md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border-l-4 border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
              >
                <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>

        <div className={`${shellCard} p-4 md:p-6`}>
          <div className="mb-4 h-6 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-700/80">
                <div className="mx-auto mb-2 h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                <div className="mx-auto mb-2 h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600" />
                <div className="mx-auto h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading weather…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-md:mx-3 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] space-y-4 md:space-y-6">
        <div className={shellCard}>
          <div className="p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Weather</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Weather data temporarily unavailable</p>
              </div>
              <Button
                onClick={refreshWeather}
                disabled={isLoading}
                className="max-md:min-h-12 max-md:w-full max-md:rounded-xl md:w-auto"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing…' : 'Try again'}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200/80 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40 md:rounded-xl md:p-6">
          <div className="flex gap-3">
            <div className="shrink-0 text-red-500">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Weather service error</h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
              <p className="mt-1 text-sm text-red-600/90 dark:text-red-400/90">
                Please check your farm location settings and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  const currentTemp = temperatureUnit === 'celsius' ? weatherData.current.temp_c : weatherData.current.temp_f;
  const feelsLikeTemp = temperatureUnit === 'celsius' ? weatherData.current.feels_like_c : weatherData.current.feels_like_f;
  const windSpeed = temperatureUnit === 'celsius' ? weatherData.current.wind_kph : weatherData.current.wind_mph;
  const windUnit = temperatureUnit === 'celsius' ? 'km/h' : 'mph';

  const metricCardClass =
    'rounded-2xl border border-gray-200/80 bg-gray-50/90 p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700/60 md:rounded-xl md:p-6';

  return (
    <div className="max-md:space-y-4 max-md:pb-[calc(9rem+env(safe-area-inset-bottom))] md:space-y-6">
      <div className={shellCard}>
        <div className="max-md:bg-gradient-to-br max-md:from-sky-500/14 max-md:via-white max-md:to-white max-md:p-4 max-md:dark:from-sky-500/12 max-md:dark:via-gray-800 max-md:dark:to-gray-800 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 md:hidden">
                <CloudSun className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Current weather</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-1 text-[13px] text-gray-600 dark:text-gray-400 md:text-base">
                  <MapPin className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span className="truncate">
                    {weatherData.location.name}, {weatherData.location.country}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 md:text-sm">
                  Updated {new Date(weatherData.last_updated).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:shrink-0">
              <div className="flex justify-stretch sm:justify-start">
                <TemperatureToggle unit={temperatureUnit} onUnitChange={setTemperatureUnit} />
              </div>
              <Button
                onClick={refreshWeather}
                disabled={isLoading}
                variant="outline"
                className="max-md:min-h-12 max-md:rounded-xl sm:min-h-10"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:px-0 px-3">
        <div className="col-span-2 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-blue-50/80 to-white p-4 shadow-md dark:border-sky-900/40 dark:from-sky-950/50 dark:via-blue-950/30 dark:to-gray-900/80 md:col-span-1 lg:col-span-1 md:rounded-xl md:p-6">
          <div className="mb-3 flex items-start justify-between gap-3 md:mb-4">
            <OpenMeteoWeatherIcon weatherCode={weatherData.hourly[0]?.weather_code || 0} size={52} />
            <div className="text-right">
              <div className="text-4xl font-extrabold tabular-nums tracking-tight text-sky-900 dark:text-sky-100 md:text-5xl">
                {Math.round(currentTemp)}°
              </div>
              <div className="text-xs font-medium text-sky-800 dark:text-sky-300 md:text-sm">
                Feels {Math.round(feelsLikeTemp)}°
              </div>
            </div>
          </div>
          <p className="text-center text-base font-semibold text-sky-900 dark:text-sky-100 md:text-lg">
            {weatherData.current.condition.text}
          </p>
        </div>

        <div className={metricCardClass}>
          <div className="mb-3 flex items-center md:mb-4">
            <Droplets className="mr-2 h-5 w-5 shrink-0 text-blue-500 md:h-6 md:w-6" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white md:text-lg md:font-medium">Humidity</h3>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <span className="text-2xl font-bold tabular-nums md:text-3xl">{weatherData.current.humidity}%</span>
            <div className="h-2.5 w-full grow rounded-full bg-gray-200 dark:bg-gray-600">
              <div
                className="h-2.5 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${weatherData.current.humidity}%` }}
              />
            </div>
          </div>
        </div>

        <div className={metricCardClass}>
          <div className="mb-3 flex items-center md:mb-4">
            <Wind className="mr-2 h-5 w-5 shrink-0 text-emerald-500 md:h-6 md:w-6" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white md:text-lg md:font-medium">Wind</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums md:text-3xl">{Math.round(windSpeed)}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 md:text-lg">{windUnit}</span>
          </div>
        </div>

        <div className={`${metricCardClass} col-span-2 md:col-span-1`}>
          <div className="mb-3 flex items-center md:mb-4">
            <Gauge className="mr-2 h-5 w-5 shrink-0 text-violet-500 md:h-6 md:w-6" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white md:text-lg md:font-medium">Pressure</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums md:text-3xl">{weatherData.current.pressure_mb}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 md:text-lg">mb</span>
          </div>
        </div>
      </div>

      <div className={`${shellCard} p-4 md:p-6`}>
        <TemperatureChart
          hourlyData={weatherData.hourly.map((hour) => ({
            ...hour,
            weather_code: hour.weather_code || 0,
          }))}
          unit={temperatureUnit}
          className="!bg-transparent !p-0 !shadow-none dark:!bg-transparent"
        />
      </div>

      {weatherData.suggestions && weatherData.suggestions.length > 0 && (
        <div className="max-md:mx-3 max-md:rounded-2xl max-md:border max-md:border-primary-200/80 max-md:bg-gradient-to-br max-md:from-primary-500/10 max-md:to-white max-md:shadow-md dark:max-md:border-primary-900/40 dark:max-md:from-primary-950/40 dark:max-md:to-gray-900/90 md:rounded-xl md:border md:border-primary-200/60 md:bg-primary-50/90 md:p-6 dark:md:border-primary-900/30 dark:md:bg-primary-950/20">
          <div className="p-4 md:p-0">
            <div className="mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 text-primary-600 dark:text-primary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white md:text-xl">Farming suggestions</h3>
            </div>
            <div className="space-y-2 md:space-y-3">
              {weatherData.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-xl border-l-4 border-primary-500 bg-white/90 p-3 shadow-sm dark:bg-gray-800/95 md:p-4"
                >
                  <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`${shellCard} p-4 md:p-6`}>
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white md:mb-6 md:text-xl">3-day forecast</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {weatherData.forecast.forecastday.map((day, index) => {
            const maxTemp = temperatureUnit === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f;
            const minTemp = temperatureUnit === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f;

            return (
              <div
                key={index}
                className="rounded-2xl border border-gray-200/80 bg-gray-50/90 p-4 text-center dark:border-gray-600 dark:bg-gray-700/50 md:rounded-xl"
              >
                <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white md:text-base">{formatDate(day.date)}</h4>
                <div className="mb-2 flex justify-center">
                  <OpenMeteoWeatherIcon weatherCode={0} size={48} />
                </div>
                <p className="mb-2 text-xs text-gray-600 dark:text-gray-400 md:text-sm">{day.day.condition.text}</p>
                <div className="mb-2 flex items-center justify-center gap-2 text-lg font-bold tabular-nums">
                  <span>{Math.round(maxTemp)}°</span>
                  <span className="font-normal text-gray-400">/</span>
                  <span className="text-gray-600 dark:text-gray-300">{Math.round(minTemp)}°</span>
                </div>
                <div className="flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">
                  <Droplets className="mr-1 h-4 w-4" />
                  <span>{day.day.daily_chance_of_rain}%</span>
                </div>
                {day.day.totalprecip_mm > 0 && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{day.day.totalprecip_mm}mm expected</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${shellCard} p-4 md:p-6`}>
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white md:text-xl">Weather alerts</h3>

        {weatherData.current.precip_mm > 10 && (
          <div className="mb-3 rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/25 md:mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="ml-2 font-semibold text-yellow-900 dark:text-yellow-100">Heavy precipitation expected</h4>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-yellow-900/90 dark:text-yellow-100/90">
              Heavy rainfall detected. Secure young plants and ensure proper drainage in fields and poultry houses.
            </p>
          </div>
        )}

        {weatherData.current.wind_kph > 20 && (
          <div className="mb-3 rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-950/25 md:mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="ml-2 font-semibold text-orange-900 dark:text-orange-100">Strong winds detected</h4>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-orange-900/90 dark:text-orange-100/90">
              Wind speeds above 20 km/h. Secure greenhouses and protect young plants from wind damage.
            </p>
          </div>
        )}

        {weatherData.current.temp_c > 35 && (
          <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-950/25">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="ml-2 font-semibold text-red-900 dark:text-red-100">High temperature alert</h4>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-red-900/90 dark:text-red-100/90">
              Temperatures above 35°C. Ensure adequate shade and water for livestock and crops. Consider adjusting work
              schedules.
            </p>
          </div>
        )}

        {weatherData.current.precip_mm <= 10 && weatherData.current.wind_kph <= 20 && weatherData.current.temp_c <= 35 && (
          <div className="rounded-xl border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-950/25">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="ml-2 font-semibold text-green-900 dark:text-green-100">Favorable conditions</h4>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-green-900/90 dark:text-green-100/90">
              Current weather is suitable for most farming activities. No immediate alerts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
