import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications — list notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read — mark as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId!;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/notifications/:id — delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId!;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    await prisma.notification.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete notification' });
  }
});

export default router;
