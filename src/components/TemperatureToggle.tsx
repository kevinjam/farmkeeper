'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TemperatureToggleProps {
  unit: 'celsius' | 'fahrenheit';
  onUnitChange: (unit: 'celsius' | 'fahrenheit') => void;
  className?: string;
}

export function TemperatureToggle({ unit, onUnitChange, className = "" }: TemperatureToggleProps) {
  return (
    <div className={`flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${className}`}>
      <Button
        variant={unit === 'celsius' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onUnitChange('celsius')}
        className={`px-3 py-1 text-sm font-medium ${
          unit === 'celsius' 
            ? 'bg-white dark:bg-gray-600 shadow-sm' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        °C
      </Button>
      <Button
        variant={unit === 'fahrenheit' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onUnitChange('fahrenheit')}
        className={`px-3 py-1 text-sm font-medium ${
          unit === 'fahrenheit' 
            ? 'bg-white dark:bg-gray-600 shadow-sm' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        °F
      </Button>
    </div>
  );
}
