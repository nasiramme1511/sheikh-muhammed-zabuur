import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { lessons: true } },
      },
    });
    res.json(levels);
  } catch {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const level = await prisma.level.findUnique({
      where: { slug: req.params.slug },
      include: {
        _count: { select: { lessons: true } },
      },
    });
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json(level);
  } catch {
    res.status(500).json({ error: 'Failed to fetch level' });
  }
});

router.get('/:slug/lessons', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const level = await prisma.level.findUnique({ where: { slug: req.params.slug } });
    if (!level) return res.status(404).json({ error: 'Level not found' });

    const lessons = await prisma.lesson.findMany({
      where: { levelId: level.id, published: true },
      orderBy: { episodeNumber: 'asc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    let userProgress: Record<number, { completed: boolean; position: number }> = {};
    if (req.userId) {
      const progress = await prisma.userProgress.findMany({
        where: { userId: req.userId, lessonId: { in: lessons.map(l => l.id) } },
        select: { lessonId: true, completed: true, position: true },
      });
      progress.forEach(p => { userProgress[p.lessonId] = { completed: p.completed, position: p.position }; });
    }

    const lessonsWithProgress = lessons.map(l => ({
      ...l,
      userProgress: userProgress[l.id] || null,
    }));

    res.json(lessonsWithProgress);
  } catch {
    res.status(500).json({ error: 'Failed to fetch level lessons' });
  }
});

export default router;
