'use client';

import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageTest() {
  const { t } = useTranslations('settings');
  const { currentLanguage, changeLanguage, getAvailableLanguages } = useLanguage();

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Language Test Component</h3>
      
      <div className="space-y-2">
        <p><strong>Current Language:</strong> {currentLanguage}</p>
        <p><strong>Translated Title:</strong> {t('title')}</p>
        <p><strong>Translated Subtitle:</strong> {t('subtitle')}</p>
        
        <div className="mt-4">
          <p className="font-medium mb-2">Available Languages:</p>
          <div className="flex gap-2">
            {getAvailableLanguages().map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-3 py-1 rounded text-sm ${
                  currentLanguage === lang.code
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
