import { createContext, useContext } from 'react';
import { Language, LANGUAGE_META, LANGUAGE_STORAGE_KEY, detectBrowserLanguage } from '../lib/language';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  meta: typeof LANGUAGE_META[Language];
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function getStoredLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (saved && (saved === 'en' || saved === 'am' || saved === 'ar' || saved === 'om')) return saved;
  } catch {}
  return detectBrowserLanguage();
}

export function applyLanguage(language: Language) {
  const meta = LANGUAGE_META[language];
  const root = document.documentElement;

  root.dir = meta.dir;
  root.classList.remove('ltr', 'rtl');
  root.classList.add(meta.dir === 'rtl' ? 'rtl' : 'ltr');
  root.lang = language;
  document.body.style.fontFamily = meta.fontFamily;

  updateSEO(language);
}

export function updateSEO(language: Language) {
  const meta = LANGUAGE_META[language];
  let link = document.querySelector('link[hreflang]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'alternate';
    document.head.appendChild(link);
  }
  link.hreflang = language;
  link.href = window.location.href;

  let ogLocale = document.querySelector('meta[property="og:locale"]') as HTMLMetaElement;
  if (!ogLocale) {
    ogLocale = document.createElement('meta');
    ogLocale.setAttribute('property', 'og:locale');
    document.head.appendChild(ogLocale);
  }
  const localeMap: Record<Language, string> = {
    en: 'en_US',
    ar: 'ar_SA',
    am: 'am_ET',
    om: 'om_ET',
  };
  ogLocale.content = localeMap[language];
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
