'use client';

import { useState } from 'react';

interface HourlyData {
  time: string;
  temp_c: number;
  temp_f: number;
  condition: {
    text: string;
    icon: string;
  };
  weather_code: number;
}

interface TemperatureChartProps {
  hourlyData: HourlyData[];
  unit: 'celsius' | 'fahrenheit';
  className?: string;
}

export function TemperatureChart({ hourlyData, unit, className = "" }: TemperatureChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Get next 24 hours of data
  const next24Hours = hourlyData.slice(0, 24);
  
  if (next24Hours.length === 0) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500 text-center">No hourly data available</p>
      </div>
    );
  }

  // Calculate chart dimensions and scaling
  const temperatures = next24Hours.map(hour => unit === 'celsius' ? hour.temp_c : hour.temp_f);
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const tempRange = maxTemp - minTemp;
  const padding = tempRange * 0.1; // 10% padding
  
  const chartMin = minTemp - padding;
  const chartMax = maxTemp + padding;
  const chartRange = chartMax - chartMin;

  // Generate SVG path for temperature line
  const generatePath = () => {
    const points = next24Hours.map((hour, index) => {
      const x = (index / (next24Hours.length - 1)) * 100;
      const temp = unit === 'celsius' ? hour.temp_c : hour.temp_f;
      const y = 100 - ((temp - chartMin) / chartRange) * 100;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">24-Hour Temperature Forecast</h3>
        <div className="text-sm text-gray-500">
          {formatDate(next24Hours[0].time)} - {formatDate(next24Hours[next24Hours.length - 1].time)}
        </div>
      </div>
      
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-32"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-200 dark:text-gray-600"
            />
          ))}
          
          {/* Temperature line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-500"
          />
          
          {/* Data points */}
          {next24Hours.map((hour, index) => {
            const x = (index / (next24Hours.length - 1)) * 100;
            const temp = unit === 'celsius' ? hour.temp_c : hour.temp_f;
            const y = 100 - ((temp - chartMin) / chartRange) * 100;
            const isHovered = hoveredIndex === index;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "3" : "2"}
                  fill="currentColor"
                  className="text-blue-500 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                />
                
                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 15}
                      y={y - 25}
                      width="30"
                      height="20"
                      fill="currentColor"
                      className="text-gray-800"
                      rx="2"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fontSize="8"
                      fill="white"
                      className="font-medium"
                    >
                      {Math.round(temp)}°
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels (time) */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {next24Hours.filter((_, index) => index % 4 === 0).map((hour, index) => (
            <span key={index} className="text-center">
              {formatTime(hour.time)}
            </span>
          ))}
        </div>
        
        {/* Y-axis labels (temperature) */}
        <div className="absolute left-0 top-0 h-32 flex flex-col justify-between text-xs text-gray-500">
          {[chartMax, (chartMax + chartMin) / 2, chartMin].map((temp, index) => (
            <span key={index} className="transform -translate-x-8">
              {Math.round(temp)}°
            </span>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-blue-500 mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400">Temperature</span>
        </div>
        <div className="text-gray-500">
          Range: {Math.round(minTemp)}° - {Math.round(maxTemp)}° {unit === 'celsius' ? 'C' : 'F'}
        </div>
      </div>
    </div>
  );
}
