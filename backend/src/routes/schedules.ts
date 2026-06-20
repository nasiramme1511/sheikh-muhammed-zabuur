import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { userId: req.userId },
      include: {
        lesson: {
          select: { id: true, title: true, slug: true, audioUrl: true, duration: true },
        },
      },
    });
    res.json(schedules);
  } catch {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, dayOfWeek, time } = req.body;
    const schedule = await prisma.schedule.create({
      data: { userId: req.userId!, lessonId, dayOfWeek, time },
    });
    res.status(201).json(schedule);
  } catch {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.schedule.deleteMany({
      where: { id: Number(req.params.id), userId: req.userId! },
    });
    res.json({ message: 'Schedule removed' });
  } catch {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;
