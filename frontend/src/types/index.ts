export type UserRole = 'USER' | 'STUDENT' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export type StudentRole = 'USER' | 'STUDENT';
export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';
export type ModeratorRole = 'MODERATOR';

export interface User {
  id: number;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  createdAt: string;
}

export interface Level {
  id: number;
  name: string;
  slug: string;
  description?: string;
  order: number;
  icon?: string;
  color?: string;
  _count?: { lessons: number };
  [key: string]: any;
}

export interface Bookmark {
  id: number;
  resourceId: number;
  lessonId?: number;
  userId: number;
  createdAt: string;
  resource?: Resource;
  lesson?: Lesson;
  [key: string]: any;
}

export interface UserProgress {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  progress: number;
  lastPosition?: number;
  position?: number;
  createdAt: string;
  updatedAt: string;
  lesson?: Lesson;
}

export interface BookmarkItem {
  id: number;
  title: string;
  url: string;
  type: string;
  lessonId?: number;
  lesson?: any;
  createdAt: string;
  [key: string]: any;
}

export interface DownloadItem {
  id: number;
  title: string;
  url: string;
  fileUrl?: string;
  type: string;
  size?: number;
  fileSize?: number;
  lessonId?: number;
  lesson?: any;
  downloadedAt: string;
  [key: string]: any;
}

export interface ListeningHistoryItem {
  id: number;
  title: string;
  url: string;
  duration?: number;
  completed?: boolean;
  progress?: number;
  position?: number;
  lastPlayedAt?: string;
  lessonId?: number;
  lesson?: any;
  playedAt: string;
  [key: string]: any;
}

export interface WatchHistoryItem {
  id: number;
  title: string;
  url: string;
  duration?: number;
  completed?: boolean;
  progress?: number;
  position?: number;
  lastWatchedAt?: string;
  lessonId?: number;
  lesson?: any;
  watchedAt: string;
  [key: string]: any;
}

export interface UsageLog {
  id: number;
  action: string;
  resourceType?: string;
  metadata?: any;
  createdAt: string;
  [key: string]: any;
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

export interface Series {
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
  totalLessons: number;
  totalHours: number;
  createdAt: string;
  updatedAt: string;
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
  videoUrl?: string;
  pdfUrl?: string;
  duration?: number;
  episodeNumber?: number;
  seriesId?: number;
  categoryId?: number;
  bookId?: number;
  levelId?: number;
  courseId?: number;
  isBeginner?: boolean;
  difficulty?: any;
  category?: any;
  book?: any;
  level?: any;
  published: boolean;
  userProgress?: UserProgress;
  isBookmarked?: boolean;
  related?: Lesson[];
  createdAt: string;
  updatedAt: string;
  series?: Series;
}

export interface SearchResults {
  lessons: Lesson[];
  audioLessons: AudioLesson[];
  videoLessons: VideoLesson[];
  resources: Resource[];
  audio: any[];
  videos: any[];
  pdfs: any[];
  recordings: any[];
  telegramChannels: any[];
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

export interface Resource {
  id: number;
  name: string;
  title: string;
  description?: string;
  category: string;
  collection?: string;
  language: string;
  author?: string;
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
  book?: Book;
}

export interface ScholarProfile {
  id: number;
  name: string;
  arabicName?: string;
  title?: string;
  biography?: string;
  shortBiography?: string;
  profileImage?: string;
  coverImage?: string;
  yearsActive?: number;
  teachingSchedule?: string[];
  qualifications?: string[];
  areasOfStudy?: string[];
  studentsCount: number;
  resourceCount: number;
  youtubeUrl?: string;
  telegramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
}

export interface SiteSettings {
  id: number;
  siteName: string;
  telegramLink?: string;
  youtubeLink?: string;
  facebookLink?: string;
  googleMapEmbed?: string;
  googleMapLink?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  copyrightText?: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
}

export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'error';

export interface OfflineResource {
  id: string;
  resourceId: number;
  type: 'AUDIO' | 'VIDEO' | 'PDF';
  title: string;
  url: string;
  fileSize: number;
  sizeHuman: string;
  duration?: number;
  thumbnail?: string;
  downloadedAt: number;
  status: DownloadStatus;
  progress: number;
  playPosition?: number;
  lastPlayedAt?: string;
}

export interface AudioLesson {
  id: number;
  title: string;
  slug: string;
  description?: string;
  audioUrl: string;
  thumbnail?: string;
  duration?: number;
  seriesId?: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoLesson {
  id: number;
  title: string;
  slug: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
  seriesId?: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface LiveStream {
  id: number;
  title: string;
  description?: string;
  streamUrl: string;
  platform: string;
  isLive: boolean;
  viewerCount: number;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveRecording {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  recordedAt?: string;
  createdAt: string;
  updatedAt: string;
}
