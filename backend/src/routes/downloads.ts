import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const downloads = await prisma.download.findMany({
      where: { userId },
      orderBy: { downloadedAt: 'desc' },
      include: {
        lesson: {
          select: { id: true, title: true, slug: true, duration: true, audioUrl: true, seriesId: true },
        },
      },
    });
    res.json(downloads);
  } catch {
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { lessonId, type, fileUrl, fileSize } = req.body;
    const download = await prisma.download.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { fileUrl, fileSize, downloadedAt: new Date() },
      create: { userId, lessonId, type, fileUrl, fileSize },
    });
    res.json(download);
  } catch {
    res.status(500).json({ error: 'Failed to save download' });
  }
});

router.delete('/:lessonId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const lessonId = parseInt(req.params.lessonId);
    await prisma.download.deleteMany({ where: { userId, lessonId } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete download' });
  }
});

export default router;
