import { TranslationKey } from './types';
import { resolveWithFallback } from './fallback';
import { en } from '../locales/en';
import { am } from '../locales/am';
import { ar } from '../locales/ar';
import { om } from '../locales/om';
import { Language } from '../../lib/language';

const dictionaries: Record<Language, any> = {
  en,
  am,
  ar,
  om,
};

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

export function createTranslator(language: Language) {
  const currentDictionary = dictionaries[language] || en;

  return function t(key: TranslationKey, params?: Record<string, string | number>): string {
    const resolved = resolveWithFallback(currentDictionary, key);
    return interpolate(resolved, params);
  };
}
