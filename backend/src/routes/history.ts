import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// ── Listening History ──

router.get('/listening', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const history = await prisma.listeningHistory.findMany({
      where: { userId },
      orderBy: { lastPlayedAt: 'desc' },
      include: {
        lesson: {
          include: { series: { select: { id: true, name: true, slug: true, image: true } } },
        },
      },
    });
    res.json(history);
  } catch {
    res.status(500).json({ error: 'Failed to fetch listening history' });
  }
});

router.post('/listening', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { lessonId, position, duration } = req.body;
    const progress = duration ? (position / duration) * 100 : 0;
    const completed = duration ? position >= duration * 0.9 : false;

    const entry = await prisma.listeningHistory.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { position, duration, progress, completed, lastPlayedAt: new Date() },
      create: { userId, lessonId, position, duration, progress, completed },
    });
    res.json(entry);
  } catch {
    res.status(500).json({ error: 'Failed to update listening history' });
  }
});

router.delete('/listening/:lessonId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const lessonId = parseInt(req.params.lessonId);
    await prisma.listeningHistory.deleteMany({ where: { userId, lessonId } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete listening history' });
  }
});

// ── Watch History ──

router.get('/watching', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const history = await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { lastWatchedAt: 'desc' },
      include: {
        lesson: {
          include: { series: { select: { id: true, name: true, slug: true, image: true } } },
        },
      },
    });
    res.json(history);
  } catch {
    res.status(500).json({ error: 'Failed to fetch watch history' });
  }
});

router.post('/watching', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { lessonId, position, duration } = req.body;
    const progress = duration ? (position / duration) * 100 : 0;
    const completed = duration ? position >= duration * 0.9 : false;

    const entry = await prisma.watchHistory.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { position, duration, progress, completed, lastWatchedAt: new Date() },
      create: { userId, lessonId, position, duration, progress, completed },
    });
    res.json(entry);
  } catch {
    res.status(500).json({ error: 'Failed to update watch history' });
  }
});

router.delete('/watching/:lessonId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const lessonId = parseInt(req.params.lessonId);
    await prisma.watchHistory.deleteMany({ where: { userId, lessonId } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete watch history' });
  }
});

export default router;
