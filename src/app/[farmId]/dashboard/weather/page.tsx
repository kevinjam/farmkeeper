'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { OpenMeteoWeatherIcon } from '@/components/OpenMeteoWeatherIcon';
import { TemperatureChart } from '@/components/TemperatureChart';
import { TemperatureToggle } from '@/components/TemperatureToggle';
import { RefreshCw, MapPin, Droplets, Wind, Eye, Thermometer, Gauge } from 'lucide-react';
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

export default function WeatherPage({ params }: { params: { farmId: string } }) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  
  // Fetch weather data
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
  
  // Refresh weather data
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
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Weather Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Temperature Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="text-right">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto animate-pulse"></div>
            </div>
          </div>
          
          {/* Other Cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded mr-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-8 ml-2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Loading Suggestions */}
        <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded mr-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Forecast */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mx-auto mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
          <div className="bg-gray-50 dark:bg-gray-700 border-l-4 border-gray-200 dark:border-gray-600 p-4">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded mr-2 animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-40 animate-pulse"></div>
            </div>
            <div className="mt-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Loading weather data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Error Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Weather Information</h2>
              <div className="flex items-center">
                <p className="text-lg text-gray-600 dark:text-gray-400">Weather data temporarily unavailable</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={refreshWeather}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Refreshing...' : 'Try Again'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Weather Service Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
                <p className="mt-1">Please check your farm location settings and try again.</p>
              </div>
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

  return (
    <div className="space-y-6">
      {/* Current Weather Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Current Weather</h2>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{weatherData.location.name}, {weatherData.location.country}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(weatherData.last_updated).toLocaleString()}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <TemperatureToggle 
              unit={temperatureUnit} 
              onUnitChange={setTemperatureUnit}
            />
            <Button 
              onClick={refreshWeather}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Current Weather Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Temperature Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <OpenMeteoWeatherIcon 
                weatherCode={weatherData.hourly[0]?.weather_code || 0} 
                size={48}
              />
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                {Math.round(currentTemp)}°
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Feels like {Math.round(feelsLikeTemp)}°
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-blue-800 dark:text-blue-200">
              {weatherData.current.condition.text}
            </p>
          </div>
        </div>
        
        {/* Humidity Card */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Droplets className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">Humidity</h3>
          </div>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{weatherData.current.humidity}%</span>
            <div className="ml-4 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${weatherData.current.humidity}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Wind Speed Card */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Wind className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg font-medium">Wind Speed</h3>
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold">{Math.round(windSpeed)}</span>
            <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">{windUnit}</span>
          </div>
        </div>
        
        {/* Pressure Card */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Gauge className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-medium">Pressure</h3>
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold">{weatherData.current.pressure_mb}</span>
            <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">mb</span>
          </div>
        </div>
      </div>

      {/* Hourly Temperature Chart */}
      <TemperatureChart 
        hourlyData={weatherData.hourly.map(hour => ({
          ...hour,
          weather_code: hour.weather_code || 0
        }))}
        unit={temperatureUnit}
      />

      {/* AI Farming Suggestions */}
      {weatherData.suggestions && weatherData.suggestions.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-xl font-bold">AI Farming Suggestions</h3>
          </div>
          <div className="space-y-3">
            {weatherData.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-primary-500">
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 3-Day Forecast */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-6">3-Day Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weatherData.forecast.forecastday.map((day, index) => {
            const maxTemp = temperatureUnit === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f;
            const minTemp = temperatureUnit === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f;
            
            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <h4 className="font-medium mb-2">{formatDate(day.date)}</h4>
                <div className="flex justify-center mb-2">
                  <OpenMeteoWeatherIcon 
                    weatherCode={0} // We'll need to get this from the API
                    size={48}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {day.day.condition.text}
                </p>
                <div className="flex justify-center space-x-2 mb-2">
                  <span className="text-lg font-bold">{Math.round(maxTemp)}°</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-lg font-bold">{Math.round(minTemp)}°</span>
                </div>
                <div className="flex items-center justify-center text-sm text-blue-500">
                  <Droplets className="h-4 w-4 mr-1" />
                  <span>{day.day.daily_chance_of_rain}%</span>
                </div>
                {day.day.totalprecip_mm > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {day.day.totalprecip_mm}mm expected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weather Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Weather Alerts for Farmers</h3>
        
        {/* Generate alerts based on current conditions */}
        {weatherData.current.precip_mm > 10 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="ml-2 font-medium">Heavy Precipitation Expected</h4>
            </div>
            <p className="mt-2 text-sm">Heavy rainfall detected. Secure young plants and ensure proper drainage in fields and poultry houses.</p>
          </div>
        )}
        
        {weatherData.current.wind_kph > 20 && (
          <div className="bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-500 p-4 mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="ml-2 font-medium">Strong Winds Detected</h4>
            </div>
            <p className="mt-2 text-sm">Wind speeds above 20 km/h. Secure greenhouses and protect young plants from wind damage.</p>
          </div>
        )}
        
        {weatherData.current.temp_c > 35 && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="ml-2 font-medium">High Temperature Alert</h4>
            </div>
            <p className="mt-2 text-sm">Temperatures above 35°C. Ensure adequate shade and water for livestock and crops. Consider adjusting work schedules.</p>
          </div>
        )}
        
        {/* Default message if no alerts */}
        {weatherData.current.precip_mm <= 10 && weatherData.current.wind_kph <= 20 && weatherData.current.temp_c <= 35 && (
          <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="ml-2 font-medium">Favorable Weather Conditions</h4>
            </div>
            <p className="mt-2 text-sm">Current weather conditions are suitable for most farming activities. No immediate weather alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
}