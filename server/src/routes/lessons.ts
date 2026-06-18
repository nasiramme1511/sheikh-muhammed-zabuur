import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, book, beginner, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { published: true };
    if (category) where.categoryId = Number(category);
    if (book) where.bookId = Number(book);
    if (beginner === 'true') where.isBeginner = true;

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.lesson.count({ where }),
    ]);

    res.json({ lessons, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

router.get('/recent', async (_req: Request, res: Response) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { published: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    res.json(lessons);
  } catch {
    res.status(500).json({ error: 'Failed to fetch recent lessons' });
  }
});

router.get('/:slug', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        book: true,
      },
    });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    let userProgress: Awaited<ReturnType<typeof prisma.userProgress.findUnique>> = null;
    let isBookmarked = false;

    if (req.userId) {
      [userProgress, isBookmarked] = await Promise.all([
        prisma.userProgress.findUnique({
          where: { userId_lessonId: { userId: req.userId, lessonId: lesson.id } },
        }),
        prisma.bookmark.findUnique({
          where: { userId_lessonId: { userId: req.userId, lessonId: lesson.id } },
        }).then(b => !!b),
      ]);
    }

    const related = await prisma.lesson.findMany({
      where: {
        published: true,
        OR: [
          { categoryId: lesson.categoryId },
        ],
        id: { not: lesson.id },
      },
      take: 5,
      include: {
      },
    });

    res.json({ ...lesson, userProgress, isBookmarked, related });
  } catch {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
