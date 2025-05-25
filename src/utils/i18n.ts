import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Configuration only, no initialization here
const i18nConfig = {
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },

  // Backend options
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  // Default namespace
  defaultNS: 'common',
  ns: ['common'], // Only load common namespace

  react: {
    useSuspense: false, // We don't want to use Suspense for loading translations
  },

  detection: {
    // order and from where user language should be detected
    order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
    
    // keys or params to lookup language from
    lookupCookie: 'NEXT_LOCALE',
    lookupLocalStorage: 'i18nextLng',
    
    // cache user language on
    caches: ['cookie', 'localStorage'],
    
    // optional expire and domain for set cookie
    cookieMaxAge: 2 * 365 * 24 * 60 * 60, // 2 years in seconds
    cookieDomain: typeof window !== 'undefined' ? window.location.hostname : '',
  }
};

// Initialize i18n only once
if (!i18n.isInitialized) {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig);
}

export default i18n; 