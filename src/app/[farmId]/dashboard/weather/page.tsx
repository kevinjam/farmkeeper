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
  location: {
    name: string;
    region: string;
    country: string;
  };
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
  const [farmLocation, setFarmLocation] = useState('Kampala');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTip, setCurrentTip] = useState('');
  
  // Fetch weather data
  useEffect(() => {
    // In a real app, this would use an actual API key and location from the farm settings
    // This is a mock implementation
    const fetchWeatherData = async () => {
      setIsLoading(true);
      try {
        // In production, you'd make an actual API call like:
        // const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${farmLocation}&days=7&aqi=no&alerts=yes`);
        // const data = await response.json();
        
        // For demonstration, we'll use mock data
        setTimeout(() => {
          const mockWeatherData: WeatherData = {
            current: {
              temp_c: 26,
              condition: {
                text: 'Partly cloudy',
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
              },
              humidity: 65,
              wind_kph: 12,
              precip_mm: 0.2,
              uv: 6
            },
            forecast: {
              forecastday: [
                {
                  date: '2025-07-06',
                  day: {
                    maxtemp_c: 28,
                    mintemp_c: 18,
                    condition: {
                      text: 'Partly cloudy',
                      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
                    },
                    daily_chance_of_rain: 20
                  }
                },
                {
                  date: '2025-07-07',
                  day: {
                    maxtemp_c: 27,
                    mintemp_c: 17,
                    condition: {
                      text: 'Moderate rain',
                      icon: '//cdn.weatherapi.com/weather/64x64/day/302.png'
                    },
                    daily_chance_of_rain: 70
                  }
                },
                {
                  date: '2025-07-08',
                  day: {
                    maxtemp_c: 26,
                    mintemp_c: 16,
                    condition: {
                      text: 'Heavy rain',
                      icon: '//cdn.weatherapi.com/weather/64x64/day/308.png'
                    },
                    daily_chance_of_rain: 90
                  }
                },
                {
                  date: '2025-07-09',
                  day: {
                    maxtemp_c: 25,
                    mintemp_c: 16,
                    condition: {
                      text: 'Moderate rain',
                      icon: '//cdn.weatherapi.com/weather/64x64/day/302.png'
                    },
                    daily_chance_of_rain: 80
                  }
                },
                {
                  date: '2025-07-10',
                  day: {
                    maxtemp_c: 26,
                    mintemp_c: 17,
                    condition: {
                      text: 'Light rain',
                      icon: '//cdn.weatherapi.com/weather/64x64/day/296.png'
                    },
                    daily_chance_of_rain: 60
                  }
                },
                {
                  date: '2025-07-11',
                  day: {
                    maxtemp_c: 27,
                    mintemp_c: 18,
                    condition: {
                      text: 'Partly cloudy',
                      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
                    },
                    daily_chance_of_rain: 20
                  }
                },
                {
                  date: '2025-07-12',
                  day: {
                    maxtemp_c: 28,
                    mintemp_c: 19,
                    condition: {
                      text: 'Sunny',
                      icon: '//cdn.weatherapi.com/weather/64x64/day/113.png'
                    },
                    daily_chance_of_rain: 0
                  }
                }
              ]
            },
            location: {
              name: 'Kampala',
              region: 'Kampala',
              country: 'Uganda'
            }
          };
          
          setWeatherData(mockWeatherData);
          setIsLoading(false);
          
          // Find matching farming tip
          const condition = mockWeatherData.current.condition.text.toLowerCase();
          const tip = farmingTips.find(t => 
            condition.includes(t.condition.toLowerCase())
          ) || farmingTips[0];
          
          setCurrentTip(tip.tip);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch weather data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [farmLocation]);
  
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
              onClick={() => {
                const newLocation = prompt('Enter location (e.g., Kampala, Entebbe, Jinja):', farmLocation);
                if (newLocation) setFarmLocation(newLocation);
              }}
            >
              Change Location
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
      
      {/* Farming Tip */}
      <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg shadow p-6">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-xl font-bold ml-2">Today's Farming Tip</h3>
        </div>
        <p className="mt-4 text-lg">{currentTip}</p>
      </div>
      
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
