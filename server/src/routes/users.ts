import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, image: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const [bookmarkCount, completedCount, progressCount, recentActivity, enrollments, pendingTasks, certificates, streak] = await Promise.all([
      prisma.bookmark.count({ where: { userId } }),
      prisma.userProgress.count({ where: { userId, completed: true } }),
      prisma.userProgress.count({ where: { userId } }),
      prisma.usageLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.enrollment.count({
        where: { student: { userId } },
      }),
      prisma.task.count({
        where: { userId, status: 'PENDING' },
      }),
      prisma.certificate.count({
        where: { student: { userId } },
      }),
      prisma.usageLog.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);
    res.json({
      bookmarkCount,
      completedCount,
      inProgressCount: progressCount - completedCount,
      recentActivity,
      enrollments,
      pendingTasks,
      certificates,
      streak,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/usage', async (req: AuthRequest, res: Response) => {
  try {
    const { action, metadata } = req.body;
    const log = await prisma.usageLog.create({
      data: { userId: req.userId!, action, metadata },
    });
    res.status(201).json(log);
  } catch {
    res.status(500).json({ error: 'Failed to log usage' });
  }
});

export default router;
