import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { requireTelegramAccess } from '../middleware/telegramAccess';

const router = Router();

// ── Public endpoints (no links returned) ──────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const channels = await prisma.telegramChannel.findMany({
      where: { enabled: true, teacherName: 'Sheikh Muhammad Zabuur' },
      orderBy: { category: 'asc' },
    });
    // Never expose links to unauthenticated/unsubscribed users
    const safe = channels.map(c => ({ id: c.id, name: c.name, teacherName: c.teacherName, description: c.description, category: c.category, enabled: c.enabled }));
    res.json(safe);
  } catch {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const channels = await prisma.telegramChannel.findMany({ where: { enabled: true, teacherName: 'Sheikh Muhammad Zabuur' }, select: { teacherName: true, category: true } });
    const total = channels.length;
    const categories = new Set(channels.map(c => c.category).filter(Boolean));
    res.json({ total, categories: categories.size });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── Protected endpoints (requires auth + subscription) ──────
router.get('/channels', authenticate, requireTelegramAccess, async (_req: AuthRequest, res: Response) => {
  try {
    const channels = await prisma.telegramChannel.findMany({
      where: { enabled: true, teacherName: 'Sheikh Muhammad Zabuur' },
      orderBy: { category: 'asc' },
    });
    res.json(channels);
  } catch {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

router.get('/collection/:slug', authenticate, requireTelegramAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const keyword = slug.replace(/[-_]/g, ' ');
    const channels = await prisma.telegramChannel.findMany({ where: { name: { contains: keyword }, enabled: true, teacherName: 'Sheikh Muhammad Zabuur' } });
    res.json(channels);
  } catch {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

router.get('/check', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.json({ allowed: false, subscribed: false });
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { newsletterSubscribed: true } });
    res.json({ allowed: !!user?.newsletterSubscribed, subscribed: !!user?.newsletterSubscribed });
  } catch {
    res.status(500).json({ error: 'Failed to check access' });
  }
});

router.get('/:id', authenticate, requireTelegramAccess, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const channel = await prisma.telegramChannel.findUnique({ where: { id } });
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    if (channel.teacherName !== 'Sheikh Muhammad Zabuur') return res.status(403).json({ error: 'Access denied' });
    res.json(channel);
  } catch {
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
});

export default router;
