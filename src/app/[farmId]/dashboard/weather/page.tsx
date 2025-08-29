'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type WeatherData = {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    precip_mm: number;
    uv: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
      };
    }>;
  };
  historical?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        totalprecip_mm: number;
      };
    }>;
  };
  location: {
    name: string;
    region: string;
    country: string;
  };
  suggestions?: string[];
  nearbyFarms?: Array<{
    farmName: string;
    distance: number;
    weather: {
      temp_c: number;
      condition: {
        text: string;
        icon: string;
      };
    };
  }>;
};

type FarmingTip = {
  condition: string;
  tip: string;
};

const farmingTips: FarmingTip[] = [
  { condition: 'Sunny', tip: 'Great day for harvesting crops. Ensure animals have shade and plenty of water.' },
  { condition: 'Partly cloudy', tip: 'Good day for field work and light spraying of crops.' },
  { condition: 'Cloudy', tip: 'Good conditions for transplanting seedlings.' },
  { condition: 'Rain', tip: 'Hold off on spraying pesticides. Check drainage systems are working properly.' },
  { condition: 'Thunderstorm', tip: 'Secure livestock in sheltered areas. Check for flooding in low-lying areas.' },
  { condition: 'Drizzle', tip: 'Light moisture good for young plants. Monitor humidity in poultry houses.' },
];

export default function WeatherPage({ params }: { params: { farmId: string } }) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [nearbyFarms, setNearbyFarms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTip, setCurrentTip] = useState('');
  
  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch(`/api/weather/${params.farmId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        setWeatherData(data);
        
        // Set farming suggestions if available
        if (data.suggestions && data.suggestions.length > 0) {
          setCurrentTip(data.suggestions[0]);
        } else {
          // Fallback to static tips based on current weather
          const condition = data.current.condition.text.toLowerCase();
          const tip = farmingTips.find(t => 
            condition.includes(t.condition.toLowerCase())
          ) || farmingTips[0];
          setCurrentTip(tip.tip);
        }
        
        // Fetch nearby farms weather
        try {
          const nearbyResponse = await fetch(`/api/weather/${params.farmId}/nearby`);
          if (nearbyResponse.ok) {
            const nearbyData = await nearbyResponse.json();
            setNearbyFarms(nearbyData.nearbyFarms || []);
          }
        } catch (nearbyError) {
          console.warn('Failed to fetch nearby farms weather:', nearbyError);
        }
        
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
      
      // Re-fetch weather data
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/weather/${params.farmId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch weather data');
          }
          
          const data = await response.json();
          setWeatherData(data);
          
          // Set farming suggestions if available
          if (data.suggestions && data.suggestions.length > 0) {
            setCurrentTip(data.suggestions[0]);
          } else {
            // Fallback to static tips based on current weather
            const condition = data.current.condition.text.toLowerCase();
            const tip = farmingTips.find(t => 
              condition.includes(t.condition.toLowerCase())
            ) || farmingTips[0];
            setCurrentTip(tip.tip);
          }
          
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
    return date.toLocaleDateString('en-UG', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
        <p className="text-red-600 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Current Weather</h2>
            <div className="flex items-center">
              <p className="text-lg">{weatherData.location.name}, {weatherData.location.country}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              className="btn btn-primary"
              onClick={refreshWeather}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Weather'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg flex flex-col items-center">
            <div className="flex items-center mb-4">
              <img 
                src={`https:${weatherData.current.condition.icon}`} 
                alt={weatherData.current.condition.text}
                width={64}
                height={64}
              />
              <span className="text-4xl font-bold ml-2">{weatherData.current.temp_c}°C</span>
            </div>
            <p className="text-lg text-center">{weatherData.current.condition.text}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Humidity</h3>
            <div className="flex items-end">
              <span className="text-3xl font-bold">{weatherData.current.humidity}%</span>
              <div className="ml-4 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${weatherData.current.humidity}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Wind Speed</h3>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-3xl font-bold ml-2">{weatherData.current.wind_kph} km/h</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Precipitation</h3>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-3xl font-bold ml-2">{weatherData.current.precip_mm} mm</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Farming Suggestions */}
      <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg shadow p-6">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-xl font-bold ml-2">AI Farming Suggestions</h3>
        </div>
        <div className="mt-4">
          {weatherData.suggestions && weatherData.suggestions.length > 0 ? (
            <div className="space-y-3">
              {weatherData.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-primary-500">
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg">{currentTip}</p>
          )}
        </div>
      </div>

      {/* Nearby Farms Weather */}
      {nearbyFarms.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Nearby Farms Weather</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyFarms.map((farm, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{farm.farmName}</h4>
                  <span className="text-sm text-gray-500">{farm.distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center">
                  <img 
                    src={`https:${farm.weather.condition.icon}`}
                    alt={farm.weather.condition.text}
                    width={32}
                    height={32}
                    className="mr-2"
                  />
                  <div>
                    <span className="text-lg font-bold">{farm.weather.temp_c}°C</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{farm.weather.condition.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Weather (Past 10 Days) */}
      {weatherData.historical && weatherData.historical.forecastday.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-6">Historical Weather (Past 10 Days)</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {weatherData.historical.forecastday.map((day, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <h4 className="text-xs font-medium mb-1">{formatDate(day.date)}</h4>
                <img 
                  src={`https:${day.day.condition.icon}`}
                  alt={day.day.condition.text}
                  className="mx-auto mb-1"
                  width={32}
                  height={32}
                />
                <div className="text-xs">
                  <div className="flex justify-center space-x-1">
                    <span className="font-medium">{Math.round(day.day.mintemp_c)}°</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-medium">{Math.round(day.day.maxtemp_c)}°</span>
                  </div>
                  <div className="mt-1 text-blue-500">
                    {day.day.totalprecip_mm}mm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 7-Day Forecast */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-6">7-Day Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weatherData.forecast.forecastday.map((day, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <h4 className="font-medium">{formatDate(day.date)}</h4>
              <img 
                src={`https:${day.day.condition.icon}`}
                alt={day.day.condition.text}
                className="mx-auto my-2"
                width={48}
                height={48}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">{day.day.condition.text}</p>
              <div className="flex justify-center space-x-2 mt-2">
                <span className="text-sm font-medium">{Math.round(day.day.mintemp_c)}°</span>
                <span className="text-gray-400">|</span>
                <span className="text-sm font-medium">{Math.round(day.day.maxtemp_c)}°</span>
              </div>
              <div className="mt-2 flex items-center justify-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span>{day.day.daily_chance_of_rain}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Weather Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Weather Alerts for Farmers</h3>
        
        {/* Mock alert - in a real app, these would come from the API or be generated based on weather conditions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="ml-2 font-medium">Heavy Rain Expected</h4>
          </div>
          <p className="mt-2 text-sm">Heavy rainfall expected on July 8-9. Secure young plants and ensure proper drainage in fields and poultry houses.</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="ml-2 font-medium">Potential Flooding in Low-Lying Areas</h4>
          </div>
          <p className="mt-2 text-sm">With heavy rainfall forecast for multiple days, low-lying areas may experience flooding. Move livestock to higher ground if necessary.</p>
        </div>
      </div>
      
      {/* Seasonal Forecast */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Seasonal Outlook</h3>
        <p className="mb-4">Uganda is currently experiencing the second rainy season (July-November). Overall rainfall is expected to be above average this year.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Rainfall Outlook</h4>
            <p className="text-sm">Above average rainfall expected in central and eastern regions. Western regions may see normal to slightly below normal rainfall.</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Temperature Outlook</h4>
            <p className="text-sm">Temperatures likely to remain near average for the season, with occasional hot spells between rain events.</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Farming Recommendations</h4>
            <p className="text-sm">Good conditions for planting maize, beans, and vegetables. Ensure proper drainage systems and consider raised beds for sensitive crops.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
