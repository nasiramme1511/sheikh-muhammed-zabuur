import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, adminOnly } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/courses — public listing
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, levelId, language, search, status } = req.query;

    const where: any = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (levelId) where.levelId = Number(levelId);
    if (language) where.language = String(language);

    if (status) {
      where.status = String(status);
    } else {
      where.status = 'PUBLISHED';
    }

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        level: { select: { id: true, name: true, slug: true } },
        _count: { select: { lessons: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:slug — course details
router.get('/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        category: true,
        level: true,
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course detail' });
  }
});

// POST /api/courses — create a course (admin only)
router.post('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, thumbnail, description, categoryId, levelId, language, duration } = req.body;

    const exists = await prisma.course.findUnique({ where: { slug } });
    if (exists) {
      return res.status(400).json({ error: 'Course slug already exists' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        thumbnail,
        description,
        categoryId: categoryId ? Number(categoryId) : null,
        levelId: levelId ? Number(levelId) : null,
        language: language || 'en',
        duration: duration ? Number(duration) : null,
        status: 'DRAFT',
      },
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create course' });
  }
});

// PUT /api/courses/:id — update a course (admin only)
router.put('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Course not found' });

    const { title, slug, thumbnail, description, categoryId, levelId, language, duration, status } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        slug,
        thumbnail,
        description,
        categoryId: categoryId ? Number(categoryId) : null,
        levelId: levelId ? Number(levelId) : null,
        language,
        duration: duration ? Number(duration) : null,
        status,
      },
    });

    res.json(course);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/courses/:id — delete a course
router.delete('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
