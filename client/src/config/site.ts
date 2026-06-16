import type { TranslationKey } from '../i18n';

export interface StatItem {
  value: string;
  key: TranslationKey;
  icon: string;
}

export interface Testimonial {
  name: string;
  country: string;
  avatar: string;
  text: string;
  rating: number;
}

/** Hero section stats */
export const heroStats: StatItem[] = [
  { value: '100+', key: 'hero.stats_teachers' as TranslationKey, icon: '\u{1F468}\u200D\u{1F3EB}' },
  { value: '500+', key: 'hero.stats_lessons' as TranslationKey, icon: '\u{1F4DA}' },
  { value: '4', key: 'hero.stats_languages' as TranslationKey, icon: '\u{1F30D}' },
  { value: 'Free', key: 'hero.stats_free' as TranslationKey, icon: '\u{1F393}' },
];

/** Testimonials */
export const testimonials: Testimonial[] = [
  {
    name: 'Aisha Mohamed',
    country: 'Ethiopia',
    avatar: 'AM',
    text: 'This platform has completely transformed my understanding of Islam. The structured courses and authentic teachers make learning so easy and enjoyable.',
    rating: 5,
  },
  {
    name: 'Ahmed Hassan',
    country: 'Somalia',
    avatar: 'AH',
    text: 'Finally, a platform that provides authentic Islamic knowledge in multiple languages. The audio lessons are perfect for learning on the go.',
    rating: 5,
  },
  {
    name: 'Fatima Ali',
    country: 'Kenya',
    avatar: 'FA',
    text: 'I started as a complete beginner and now I can recite Quran with proper Tajweed. The teachers are patient and knowledgeable. Jazakallah khair!',
    rating: 5,
  },
  {
    name: 'Omar Abdirahman',
    country: 'USA',
    avatar: 'OA',
    text: 'The level system is brilliant. It guides you step by step from basics to advanced topics. The Telegram channels are a great bonus for daily learning.',
    rating: 4,
  },
];
/** Stats section data (used by StatsSection component) */
export const statsData: Array<{ value: number; suffix: string; labelKey: string; descKey: string }> = [
  { value: 100, suffix: '+', labelKey: 'stats.teachers', descKey: 'stats.teachers_desc' },
  { value: 500, suffix: '+', labelKey: 'stats.lessons', descKey: 'stats.lessons_desc' },
  { value: 4,   suffix: '',  labelKey: 'stats.languages', descKey: 'stats.languages_desc' },
  { value: 0,   suffix: '',  labelKey: 'stats.cost', descKey: 'stats.cost_desc' },
];
