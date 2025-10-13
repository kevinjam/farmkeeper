'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api';

export type Language = 'en' | 'lg' | 'sw';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
  getLanguageDisplayName: (lang: Language) => string;
  getAvailableLanguages: () => Array<{ code: Language; name: string }>;
  isDefaultLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'farmkeeper-language';
const DEFAULT_LANGUAGE: Language = 'en';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load language from localStorage on mount
  useEffect(() => {
    const loadLanguage = () => {
      try {
        const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
        if (storedLanguage && ['en', 'lg', 'sw'].includes(storedLanguage)) {
          setCurrentLanguage(storedLanguage);
        } else {
          setCurrentLanguage(DEFAULT_LANGUAGE);
        }
      } catch (error) {
        console.error('Error loading language from localStorage:', error);
        setCurrentLanguage(DEFAULT_LANGUAGE);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // Change language function
  const changeLanguage = async (newLanguage: Language) => {
    try {
      setIsLoading(true);
      
      // Update local state immediately for instant UI update
      setCurrentLanguage(newLanguage);
      
      // Save to localStorage
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      
      // Save to backend if user is authenticated
      try {
        await apiClient.updateUserLanguage(newLanguage);
      } catch (error) {
        console.warn('Failed to save language preference to backend:', error);
        // Don't throw error here as local storage is more important
      }
      
      // Update URL to reflect new language without full page reload
      const currentPath = pathname;
      const pathWithoutLocale = currentPath.replace(/^\/(en|lg|sw)/, '') || '/';
      const newPath = `/${newLanguage}${pathWithoutLocale}`;
      
      // Use router.replace to update URL without triggering a full reload
      router.replace(newPath);
      
    } catch (error) {
      console.error('Error changing language:', error);
      // Revert to previous language on error
      setCurrentLanguage(currentLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get language display name
  const getLanguageDisplayName = (lang: Language): string => {
    const names: Record<Language, string> = {
      en: 'English',
      lg: 'Luganda',
      sw: 'Kiswahili'
    };
    return names[lang];
  };

  // Get all available languages
  const getAvailableLanguages = (): Array<{ code: Language; name: string }> => {
    return [
      { code: 'en', name: 'English' },
      { code: 'lg', name: 'Luganda' },
      { code: 'sw', name: 'Kiswahili' }
    ];
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isLoading,
    getLanguageDisplayName,
    getAvailableLanguages,
    isDefaultLanguage: currentLanguage === DEFAULT_LANGUAGE
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
