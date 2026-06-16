import type { Book } from '../types';

export type BookLang = 'en' | 'ar' | 'am' | 'om';

const TITLE_MAP: Record<BookLang, keyof Book> = {
  en: 'title',
  ar: 'titleArabic',
  am: 'titleAmharic',
  om: 'titleOromic',
};

const DESC_MAP: Record<BookLang, keyof Book> = {
  en: 'description',
  ar: 'descriptionArabic',
  am: 'descriptionAmharic',
  om: 'descriptionOromic',
};

const PDF_MAP: Record<BookLang, keyof Book> = {
  en: 'pdfUrl',
  ar: 'pdfUrlAr',
  am: 'pdfUrlAm',
  om: 'pdfUrlOm',
};

const COVER_MAP: Record<BookLang, keyof Book> = {
  en: 'coverImage',
  ar: 'coverImageAr',
  am: 'coverImageAm',
  om: 'coverImageOm',
};

const FALLBACK_ORDER: BookLang[] = ['en', 'ar', 'am', 'om'];

export function getLocalizedTitle(book: Book, lang: BookLang): string {
  return (book[TITLE_MAP[lang]] as string) || book.title || '';
}

export function getLocalizedDescription(book: Book, lang: BookLang): string | undefined {
  return (book[DESC_MAP[lang]] as string) || book.description || undefined;
}

export function getLocalizedPdfUrl(book: Book, lang: BookLang): string | null {
  const direct = book[PDF_MAP[lang]] as string | undefined;
  if (direct) return direct;
  for (const fallback of FALLBACK_ORDER) {
    const url = book[PDF_MAP[fallback]] as string | undefined;
    if (url) return url;
  }
  return null;
}

export function getLocalizedCoverImage(book: Book, lang: BookLang): string | null {
  const direct = book[COVER_MAP[lang]] as string | undefined;
  if (direct) return direct;
  for (const fallback of FALLBACK_ORDER) {
    const url = book[COVER_MAP[fallback]] as string | undefined;
    if (url) return url;
  }
  return null;
}

export function getAvailableLanguages(book: Book): BookLang[] {
  return FALLBACK_ORDER.filter((lang) => !!book[PDF_MAP[lang]]);
}

export function getDownloadUrl(pdfUrl: string): string {
  if (pdfUrl.startsWith('http')) return pdfUrl;
  return `/api/books/download/${encodeURIComponent(pdfUrl.split('/').pop() || '')}`;
}
