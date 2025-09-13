'use client';

import { useState } from 'react';

interface WeatherIconProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function WeatherIcon({ 
  src, 
  alt, 
  width = 64, 
  height = 64, 
  className = '',
  fallbackIcon 
}: WeatherIconProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Default fallback icon
  const defaultFallback = (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <svg 
        className="w-8 h-8 text-gray-400 dark:text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" 
        />
      </svg>
    </div>
  );

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // If image failed to load, show fallback
  if (imageError) {
    return fallbackIcon || defaultFallback;
  }

  return (
    <div className="relative">
      {/* Loading placeholder */}
      {imageLoading && (
        <div 
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
}

// Predefined weather icon components for common conditions
export const WeatherIconSunny = ({ className = '', size = 64 }: { className?: string; size?: number }) => (
  <div 
    className={`bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    <svg 
      className="w-8 h-8 text-yellow-500 dark:text-yellow-400" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </svg>
  </div>
);

export const WeatherIconCloudy = ({ className = '', size = 64 }: { className?: string; size?: number }) => (
  <div 
    className={`bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    <svg 
      className="w-8 h-8 text-gray-500 dark:text-gray-400" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  </div>
);

export const WeatherIconRainy = ({ className = '', size = 64 }: { className?: string; size?: number }) => (
  <div 
    className={`bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    <svg 
      className="w-8 h-8 text-blue-500 dark:text-blue-400" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      <path d="M8 19l2 2 2-2M8 15l2 2 2-2M8 11l2 2 2-2" stroke="currentColor" strokeWidth={1} fill="none" />
    </svg>
  </div>
);

export const WeatherIconStormy = ({ className = '', size = 64 }: { className?: string; size?: number }) => (
  <div 
    className={`bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    <svg 
      className="w-8 h-8 text-purple-500 dark:text-purple-400" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      <path d="M13 16l-4-4 4-4" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

// Smart weather icon that chooses appropriate fallback based on condition
export const SmartWeatherIcon = ({ 
  condition, 
  src, 
  alt, 
  width = 64, 
  height = 64, 
  className = '' 
}: { 
  condition: string; 
  src: string; 
  alt: string; 
  width?: number; 
  height?: number; 
  className?: string; 
}) => {
  const conditionLower = condition.toLowerCase();
  
  let fallbackIcon;
  
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
    fallbackIcon = <WeatherIconSunny size={width} className={className} />;
  } else if (conditionLower.includes('cloud')) {
    fallbackIcon = <WeatherIconCloudy size={width} className={className} />;
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    fallbackIcon = <WeatherIconRainy size={width} className={className} />;
  } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    fallbackIcon = <WeatherIconStormy size={width} className={className} />;
  } else {
    fallbackIcon = <WeatherIconCloudy size={width} className={className} />;
  }

  return (
    <WeatherIcon
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fallbackIcon={fallbackIcon}
    />
  );
};
