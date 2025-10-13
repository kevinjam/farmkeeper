'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type TranslationKey = string;
type TranslationValue = string | string[] | Record<string, any>;

interface Translations {
  [key: string]: TranslationValue;
}

// Import translation files directly
import enTranslations from '../../public/locales/en/common.json';
import lgTranslations from '../../public/locales/lg/common.json';
import swTranslations from '../../public/locales/sw/common.json';

const translationFiles = {
  en: enTranslations,
  lg: lgTranslations,
  sw: swTranslations,
};

export function useTranslations(namespace: string) {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const loadTranslations = () => {
      try {
        const translationData = translationFiles[currentLanguage] || translationFiles.en;
        // For 'common' namespace, return the entire data object
        // For other namespaces, look for nested data
        const namespaceTranslations = namespace === 'common' ? translationData : ((translationData as any)[namespace] || {});
        
        setTranslations(namespaceTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
        setTranslations({});
      }
    };

    loadTranslations();
  }, [currentLanguage, namespace]);

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    return fallback || key;
  };

  // For raw access to arrays/objects
  const raw = (key: string): any => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  };

  return { t, raw, isLoading: false };
}
