import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        lesson: {
          include: {
            series: { select: { id: true, name: true, slug: true, image: true } },
          },
        },
      },
    });
    res.json(bookmarks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

router.post('/lesson/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const existing = await prisma.bookmark.findFirst({
      where: { userId: req.userId!, lessonId, type: 'LESSON' },
    });
    if (existing) return res.status(200).json(existing);
    const bookmark = await prisma.bookmark.create({
      data: { userId: req.userId!, lessonId, type: 'LESSON' },
    });
    res.status(201).json(bookmark);
  } catch {
    res.status(500).json({ error: 'Failed to bookmark' });
  }
});

router.post('/series/:seriesId', async (req: AuthRequest, res: Response) => {
  try {
    const seriesId = Number(req.params.seriesId);
    const existing = await prisma.bookmark.findFirst({
      where: { userId: req.userId!, seriesId, type: 'SERIES' },
    });
    if (existing) return res.status(200).json(existing);
    const bookmark = await prisma.bookmark.create({
      data: { userId: req.userId!, seriesId, type: 'SERIES' },
    });
    res.status(201).json(bookmark);
  } catch {
    res.status(500).json({ error: 'Failed to bookmark series' });
  }
});

router.delete('/lesson/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    await prisma.bookmark.deleteMany({
      where: { userId: req.userId!, lessonId, type: 'LESSON' },
    });
    res.json({ message: 'Bookmark removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

router.get('/check/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const bookmark = await prisma.bookmark.findFirst({
      where: { userId: req.userId!, lessonId, type: 'LESSON' },
    });
    res.json({ bookmarked: !!bookmark });
  } catch {
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
});

export default router;
