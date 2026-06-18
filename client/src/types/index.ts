export interface User {
  id: number;
  email: string;
  name: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  nameAmharic?: string;
  nameArabic?: string;
  nameOromic?: string;
  slug: string;
  description?: string;
  descriptionAmharic?: string;
  descriptionArabic?: string;
  descriptionOromic?: string;
  image?: string;
  icon?: string;
  color?: string;
  order: number;
  isBeginner: boolean;
  _count?: { lessons: number; books: number };
  books?: Book[];
  lessons?: Lesson[];
}

export interface Book {
  id: number;
  title: string;
  titleAmharic?: string;
  titleArabic?: string;
  titleOromic?: string;
  slug: string;
  description?: string;
  descriptionAmharic?: string;
  descriptionArabic?: string;
  descriptionOromic?: string;
  author?: string;
  pdfUrl?: string;
  pdfUrlAr?: string;
  pdfUrlAm?: string;
  pdfUrlOm?: string;
  coverImage?: string;
  coverImageAr?: string;
  coverImageAm?: string;
  coverImageOm?: string;
  categoryId?: number;
  isBeginner: boolean;
  category?: Category;
  lessons?: Lesson[];
  _count?: { lessons: number };
}

export interface Level {
  id: number;
  name: string;
  nameAmharic?: string;
  nameArabic?: string;
  nameOromic?: string;
  slug: string;
  description?: string;
  descriptionAmharic?: string;
  descriptionArabic?: string;
  descriptionOromic?: string;
  order: number;
  icon?: string;
  color?: string;
  _count?: { lessons: number };
}

export interface Lesson {
  id: number;
  title: string;
  titleAmharic?: string;
  titleArabic?: string;
  titleOromic?: string;
  slug: string;
  description?: string;
  descriptionAmharic?: string;
  descriptionArabic?: string;
  descriptionOromic?: string;
  audioUrl: string;
  pdfUrl?: string;
  videoUrl?: string;
  transcript?: string;
  notes?: string;
  duration?: number;
  episodeNumber?: number;
  categoryId?: number;
  bookId?: number;
  levelId?: number;
  courseId?: number;
  difficulty: string;
  isBeginner: boolean;
  published: boolean;
  createdAt: string;
  category?: Category;
  book?: Book;
  level?: Level;
  userProgress?: UserProgress | null;
  isBookmarked?: boolean;
  related?: Lesson[];
}

export interface Bookmark {
  id: number;
  userId: number;
  lessonId: number;
  createdAt: string;
  lesson: Lesson;
}

export interface UserProgress {
  id: number;
  userId: number;
  lessonId: number;
  position: number;
  completed: boolean;
  updatedAt: string;
  lesson?: Lesson;
}

export interface Schedule {
  id: number;
  userId: number;
  lessonId: number;
  dayOfWeek?: number;
  time?: string;
  active: boolean;
  lesson: { id: number; title: string; slug: string; audioUrl: string; duration?: number };
}

export interface SearchResults {
  audio: Resource[];
  videos: Resource[];
  pdfs: Resource[];
  recordings: Resource[];
  telegramChannels?: {
    id: number;
    name: string;
    link: string;
    teacherName: string | null;
    description: string | null;
  }[];
}

export interface ChannelData {
  id: number;
  name: string;
  link: string;
  teacherName: string | null;
  description: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  description?: string;
  categoryId?: number;
  levelId?: number;
  language: string;
  duration?: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
  category?: Category;
  level?: Level;
  lessons?: Lesson[];
  announcements?: Announcement[];
  _count?: { lessons: number };
}

export interface Announcement {
  id: number;
  courseId?: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface UsageLog {
  id: number;
  userId: number;
  lessonId?: number;
  resourceId?: number;
  action: string;
  metadata?: string;
  createdAt: string;
  lesson?: Lesson;
  resource?: Resource;
}

export interface Resource {
  id: number;
  name: string;
  title: string;
  description?: string;
  category: string;
  collection?: string;
  language: string;
  author?: string;
  bookId?: number;
  url: string;
  size: number;
  sizeHuman: string;
  type: string;
  fileType: string;
  resourceType: 'PDF' | 'AUDIO' | 'VIDEO' | 'IMAGE';
  createdAt: string;
  featured: boolean;
  published?: boolean;
  downloads: number;
  views: number;
  thumbnail?: string;
  book?: { id: number; title: string; slug?: string };
}

export interface ScholarProfile {
  id: number;
  name: string;
  title?: string;
  biography?: string;
  shortBiography?: string;
  profileImage?: string;
  coverImage?: string;
  yearsActive?: number;
  studentsCount: number;
  resourceCount: number;
  youtubeUrl?: string;
  telegramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
}

export interface SiteSettings {
  id: number;
  siteName: string;
  siteDescription?: string;
  logo?: string;
  favicon?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  copyrightText?: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
}

