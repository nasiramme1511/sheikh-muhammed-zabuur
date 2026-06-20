import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, LANGUAGE_META, LANGUAGE_STORAGE_KEY } from '../lib/language';
import { LanguageContext, getStoredLanguage, applyLanguage } from './LanguageContext';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);
  const dir = LANGUAGE_META[language].dir;

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, lang); } catch {}
    applyLanguage(lang);
  }, []);

  // Apply language on mount
  useEffect(() => {
    applyLanguage(language);
  }, []);

  // Apply on change
  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  const meta = LANGUAGE_META[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, meta }}>
      {children}
    </LanguageContext.Provider>
  );
}
