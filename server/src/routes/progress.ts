import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        lesson: {
          include: {
            teacher: { select: { id: true, name: true, image: true } },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    res.json(progress);
  } catch {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.put('/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const { position, completed } = req.body;
    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: req.userId!, lessonId } },
      update: { position: position ?? 0, completed: completed ?? false },
      create: { userId: req.userId!, lessonId, position: position ?? 0, completed: completed ?? false },
    });
    res.json(progress);
  } catch {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
