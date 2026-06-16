import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { lessons: true, quizzes: true } },
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
        _count: { select: { lessons: true, quizzes: true } },
        quizzes: true,
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
        teacher: { select: { id: true, name: true, image: true, slug: true } },
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

router.post('/quizzes/:id/attempt', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const quizId = Number(req.params.id);
    const { answerIndex } = req.body;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const correct = answerIndex === quiz.correctIndex;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.userId!,
        quizId,
        answerIndex,
        correct,
      },
    });

    res.json({ correct, attempt });
  } catch {
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
});

export default router;