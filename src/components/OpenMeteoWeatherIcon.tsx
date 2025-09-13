'use client';

import { SunIcon, CloudIcon, CloudRainIcon, CloudLightningIcon, CloudSnowIcon, EyeIcon } from 'lucide-react';

interface OpenMeteoWeatherIconProps {
  weatherCode: number;
  size?: number;
  className?: string;
}

// Weather code to icon mapping based on Open-Meteo documentation
const getWeatherIcon = (weatherCode: number, size: number = 24) => {
  const iconProps = { size, className: "text-current" };
  
  // Clear sky
  if (weatherCode === 0) {
    return <SunIcon {...iconProps} className="text-yellow-500" />;
  }
  
  // Mainly clear, partly cloudy, overcast
  if (weatherCode >= 1 && weatherCode <= 3) {
    return <CloudIcon {...iconProps} className="text-gray-400" />;
  }
  
  // Fog
  if (weatherCode === 45 || weatherCode === 48) {
    return <EyeIcon {...iconProps} className="text-gray-300" />;
  }
  
  // Drizzle
  if (weatherCode >= 51 && weatherCode <= 55) {
    return <CloudRainIcon {...iconProps} className="text-blue-400" />;
  }
  
  // Rain
  if (weatherCode >= 61 && weatherCode <= 65) {
    return <CloudRainIcon {...iconProps} className="text-blue-600" />;
  }
  
  // Snow
  if (weatherCode >= 71 && weatherCode <= 77) {
    return <CloudSnowIcon {...iconProps} className="text-blue-200" />;
  }
  
  // Rain showers
  if (weatherCode >= 80 && weatherCode <= 82) {
    return <CloudRainIcon {...iconProps} className="text-blue-500" />;
  }
  
  // Snow showers
  if (weatherCode >= 85 && weatherCode <= 86) {
    return <CloudSnowIcon {...iconProps} className="text-blue-300" />;
  }
  
  // Thunderstorm
  if (weatherCode >= 95 && weatherCode <= 99) {
    return <CloudLightningIcon {...iconProps} className="text-purple-500" />;
  }
  
  // Default fallback
  return <CloudIcon {...iconProps} className="text-gray-400" />;
};

export function OpenMeteoWeatherIcon({ weatherCode, size = 24, className = "" }: OpenMeteoWeatherIconProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {getWeatherIcon(weatherCode, size)}
    </div>
  );
}
