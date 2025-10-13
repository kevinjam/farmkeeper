'use client';

import { useState } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Check, ChevronDown, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage, isLoading, getLanguageDisplayName, getAvailableLanguages } = useLanguage();
  const { t } = useTranslations('settings');
  const [isOpen, setIsOpen] = useState(false);

  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage !== currentLanguage) {
      await changeLanguage(newLanguage);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('language')}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span>{getLanguageDisplayName(currentLanguage)}</span>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
              <div className="py-1">
                {availableLanguages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => handleLanguageChange(language.code)}
                    className="w-full px-3 py-2 text-left text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{language.name}</span>
                    </div>
                    {currentLanguage === language.code && (
                      <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
}
