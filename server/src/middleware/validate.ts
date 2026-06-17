import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validate(schema: z.ZodObject<any, any> | z.ZodEffects<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      next(err);
    }
  };
}

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  teacherId: z.union([z.number(), z.string(), z.null()]).optional(),
  bookId: z.union([z.number(), z.string(), z.null()]).optional(),
  resourceType: z.enum(['PDF', 'AUDIO', 'VIDEO', 'IMAGE']),
  language: z.string().max(10).optional(),
  featured: z.union([z.boolean(), z.string()]).optional(),
  collection: z.string().nullable().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  nameAmharic: z.string().optional().nullable(),
  nameArabic: z.string().optional().nullable(),
  nameOromic: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAmharic: z.string().optional().nullable(),
  descriptionArabic: z.string().optional().nullable(),
  descriptionOromic: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  order: z.number().optional().nullable(),
  isBeginner: z.boolean().optional().nullable(),
});

export const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  nameAmharic: z.string().optional().nullable(),
  nameArabic: z.string().optional().nullable(),
  nameOromic: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  bioAmharic: z.string().optional().nullable(),
  bioArabic: z.string().optional().nullable(),
  bioOromic: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  verified: z.boolean().optional().nullable(),
  featured: z.boolean().optional().nullable(),
});

export const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  titleAmharic: z.string().optional().nullable(),
  titleArabic: z.string().optional().nullable(),
  titleOromic: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.number().optional().nullable(),
  teacherId: z.number().optional().nullable(),
  bookId: z.number().optional().nullable(),
  published: z.boolean().optional().nullable(),
});

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  titleAmharic: z.string().optional().nullable(),
  titleArabic: z.string().optional().nullable(),
  titleOromic: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  categoryId: z.number().optional().nullable(),
  teacherId: z.number().optional().nullable(),
});

export const levelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  nameAmharic: z.string().optional().nullable(),
  nameArabic: z.string().optional().nullable(),
  nameOromic: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  order: z.number().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

export const telegramSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  link: z.string().url('Invalid URL').min(1, 'Link is required'),
  teacherName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  enabled: z.boolean().optional().nullable(),
});

export const quizSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  questionAmharic: z.string().optional().nullable(),
  questionArabic: z.string().optional().nullable(),
  questionOromic: z.string().optional().nullable(),
  options: z.any().optional(),
  correctIndex: z.number().optional().nullable(),
});
