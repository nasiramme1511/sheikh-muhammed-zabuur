import { en } from '../locales/en';
import { TranslationKey } from './types';

// Helper to access nested object properties via dot-notation string
export function getNestedTranslation(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  
  return typeof current === 'string' ? current : undefined;
}

export function resolveWithFallback(
  currentDictionary: any,
  key: TranslationKey
): string {
  // 1. Try resolving from the current language dictionary
  const currentTranslation = getNestedTranslation(currentDictionary, key);
  if (currentTranslation) {
    return currentTranslation;
  }

  // 2. Fallback to English dictionary
  const englishFallback = getNestedTranslation(en, key);
  if (englishFallback) {
    // In development mode, log a warning about missing translation
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation for key: "${key}". Falling back to English.`);
    }
    return englishFallback;
  }

  // 3. Absolute fallback: return the key itself
  console.warn(`Translation completely missing for key: "${key}"`);
  return key;
}
