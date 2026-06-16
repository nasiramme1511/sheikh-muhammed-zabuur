export type Language = 'en' | 'am' | 'ar' | 'om';

export interface LanguageMeta {
  code: Language;
  native: string;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  font: string;
  fontFamily: string;
}

export const LANGUAGE_META: Record<Language, LanguageMeta> = {
  en: {
    code: 'en',
    native: 'English',
    name: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
    font: 'Poppins',
    fontFamily: "'Poppins', system-ui, sans-serif",
  },
  ar: {
    code: 'ar',
    native: 'العربية',
    name: 'Arabic',
    flag: '🇸🇦',
    dir: 'rtl',
    font: 'Cairo',
    fontFamily: "'Cairo', 'Poppins', sans-serif",
  },
  am: {
    code: 'am',
    native: 'አማርኛ',
    name: 'Amharic',
    flag: '🇪🇹',
    dir: 'ltr',
    font: 'Noto Sans Ethiopic',
    fontFamily: "'Noto Sans Ethiopic', 'Poppins', sans-serif",
  },
  om: {
    code: 'om',
    native: 'Afaan Oromoo',
    name: 'Oromic',
    flag: '🇪🇹',
    dir: 'ltr',
    font: 'Inter',
    fontFamily: "'Inter', 'Poppins', sans-serif",
  },
};

export const LANGUAGES = Object.values(LANGUAGE_META);

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  am: 'Amharic',
  ar: 'Arabic',
  om: 'Oromic',
};

export const LANGUAGE_SHORT: Record<Language, string> = {
  en: 'EN',
  am: 'አማ',
  ar: 'العربية',
  om: 'OR',
};

export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const langs = navigator.languages || [navigator.language];
  for (const lang of langs) {
    const code = lang.slice(0, 2);
    if (code === 'ar') return 'ar';
    if (code === 'am') return 'am';
    if (code === 'om' || code === 'or') return 'om';
    if (code === 'en') return 'en';
  }
  return 'en';
}

const SUFFIX_MAP: Record<Language, string> = {
  en: '',
  am: 'Amharic',
  ar: 'Arabic',
  om: 'Oromic',
};

export function getDirection(language: Language): 'rtl' | 'ltr' {
  return LANGUAGE_META[language].dir;
}

export function getLocalizedField(
  entity: Record<string, any>,
  fieldName: string,
  lang: Language
): string {
  if (lang === 'en') return entity[fieldName] || '';
  const suffix = SUFFIX_MAP[lang];
  const langField = `${fieldName}${suffix}`;
  return entity[langField] || entity[fieldName] || '';
}

export const LANGUAGE_STORAGE_KEY = 'icc-language';
export const THEME_STORAGE_KEY = 'icc-theme';
