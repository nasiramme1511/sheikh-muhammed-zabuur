export interface User {
  id: number;
  email: string;
  name: string;
  image?: string;
  role: 'USER' | 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
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
  teachers?: Teacher[];
  books?: Book[];
  lessons?: Lesson[];
}

export interface Teacher {
  id: number;
  name: string;
  nameAmharic?: string;
  nameArabic?: string;
  nameOromic?: string;
  slug: string;
  bio?: string;
  bioAmharic?: string;
  bioArabic?: string;
  bioOromic?: string;
  image?: string;
  telegram?: string;
  youtube?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  whatsapp?: string;
  website?: string;
  languages?: string;
  specialties?: string;
  education?: string;
  verified?: boolean;
  featured?: boolean;
  studentsCount?: number;
  _count?: { lessons: number };
  lessons?: Lesson[];
  books?: Book[];
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
  teacherId?: number;
  isBeginner: boolean;
  category?: Category;
  teacher?: Teacher;
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
  _count?: { lessons: number; quizzes: number };
  quizzes?: Quiz[];
}

export interface Quiz {
  id: number;
  levelId?: number;
  courseId?: number;
  lessonId?: number;
  question: string;
  questionAmharic?: string;
  questionArabic?: string;
  questionOromic?: string;
  type: string; // MCQ, TF, FILL, MATCH
  options: string;
  correctIndex?: number;
  correctText?: string;
  points: number;
  createdAt: string;
}

export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  answerIndex?: number;
  answerText?: string;
  correct: boolean;
  score: number;
  createdAt: string;
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
  teacherId?: number;
  bookId?: number;
  levelId?: number;
  courseId?: number;
  moduleId?: number;
  difficulty: string;
  isBeginner: boolean;
  published: boolean;
  createdAt: string;
  category?: Category;
  teacher?: Teacher;
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
  teacherId?: number;
  categoryId?: number;
  levelId?: number;
  language: string;
  duration?: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
  teacher?: Teacher;
  category?: Category;
  level?: Level;
  modules?: Module[];
  lessons?: Lesson[];
  enrollments?: Enrollment[];
  assignments?: Assignment[];
  announcements?: Announcement[];
  _count?: { lessons: number; enrollments: number };
}

export interface Module {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
}

export interface LessonProgress {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  watchPercentage: number;
  completedAt?: string;
  updatedAt: string;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  completedAt?: string;
  course?: Course;
}

export interface Assignment {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  fileUrl?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
  submissions?: Submission[];
  _count?: { submissions: number };
}

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  fileUrl: string;
  status: 'PENDING' | 'REVIEWED' | 'PASSED' | 'FAILED' | 'REVISION';
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  student?: { id: number; user: { id: number; name: string; email: string } };
  assignment?: Assignment;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'COMPLETED';
  type: 'ASSIGNMENT' | 'QUIZ' | 'LESSON' | 'REVIEW' | 'ADMIN' | 'SYSTEM';
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: number;
  studentId: number;
  courseId: number;
  studentName: string;
  courseName: string;
  teacherName: string;
  issueDate: string;
  verificationCode: string;
  qrCode?: string;
  course?: { title: string; slug: string; thumbnail?: string };
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
  teacherId?: number;
  bookId?: number;
  url: string;
  size: number;
  sizeHuman: string;
  type: string;
  fileType: string;
  resourceType: 'PDF' | 'AUDIO' | 'VIDEO' | 'IMAGE';
  createdAt: string;
  featured: boolean;
  downloads: number;
  views: number;
  thumbnail?: string;
  teacher?: { id: number; name: string; slug?: string };
  book?: { id: number; title: string; slug?: string };
}

