import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createTranslator } from './core/createTranslator';
import { TranslationKey } from './core/types';

export function useTranslation() {
  const { language, setLanguage } = useLanguage();

  const t = useMemo(() => createTranslator(language), [language]);

  return { t, language, setLanguage };
}

export type { TranslationKey };

export type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;
