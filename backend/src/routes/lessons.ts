import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, book, beginner, series, page = '1', limit = '20', sort } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { published: true };
    if (category) where.categoryId = Number(category);
    if (book) where.bookId = Number(book);
    if (series) where.seriesId = Number(series);
    if (beginner === 'true') where.isBeginner = true;

    const orderBy: any = sort === 'latest' ? { createdAt: 'desc' } : { episodeNumber: 'asc' };

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          series: { select: { id: true, name: true, slug: true, image: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.lesson.count({ where }),
    ]);

    res.json(lessons);
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
        series: { select: { id: true, name: true, slug: true, image: true } },
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
        series: true,
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
        prisma.bookmark.findFirst({
          where: { userId: req.userId, lessonId: lesson.id, type: 'LESSON' },
        }).then(b => !!b),
      ]);
    }

    const related = await prisma.lesson.findMany({
      where: {
        published: true,
        OR: [
          { seriesId: lesson.seriesId },
          { categoryId: lesson.categoryId },
        ].filter(Boolean),
        id: { not: lesson.id },
      },
      take: 5,
      include: {
        series: { select: { id: true, name: true, slug: true, image: true } },
      },
    });

    res.json({ ...lesson, userProgress, isBookmarked, related });
  } catch {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
