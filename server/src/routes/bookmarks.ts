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
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    res.json(bookmarks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

router.post('/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const bookmark = await prisma.bookmark.create({
      data: { userId: req.userId!, lessonId },
    });
    res.status(201).json(bookmark);
  } catch {
    res.status(500).json({ error: 'Failed to bookmark' });
  }
});

router.delete('/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    await prisma.bookmark.deleteMany({
      where: { userId: req.userId!, lessonId },
    });
    res.json({ message: 'Bookmark removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

export default router;
