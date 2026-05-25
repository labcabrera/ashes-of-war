/**
 * i18n configuration for Ashes of War.
 * Uses static imports for locale files — no HTTP backend.
 * Persists the selected language to localStorage key "aow:i18n-locale".
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './en/translation.json';
import esTranslation from './es/translation.json';

const LOCALE_KEY = 'aow:i18n-locale';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
    },
    supportedLngs: ['en', 'es'],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_KEY,
      caches: ['localStorage'],
    },
  });

export { LOCALE_KEY };
export default i18n;
