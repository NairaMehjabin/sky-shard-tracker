import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import resourceEn from './en.json';
import { translations, codeLangs } from './locales.json';

export type Translation = typeof resourceEn;

i18n.use(initReactI18next).init({
  resources: {
    en: resourceEn,
    ...translations,
  },
  fallbackLng: 'en',
  // Next.js uses process.env.NODE_ENV instead of import.meta.env.DEV
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Translation;
  }
}

// Ensure codeLangs exists before assigning to prevent runtime crashes
if (codeLangs) {
  codeLangs['en'] = 'English';
}

export const languageCode = codeLangs;