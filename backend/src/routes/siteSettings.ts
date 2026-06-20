import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      return res.status(404).json({ error: 'Site settings not found' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

router.put('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.siteSettings.findFirst();
    if (!existing) {
      const settings = await prisma.siteSettings.create({ data: req.body });
      return res.json(settings);
    }
    const settings = await prisma.siteSettings.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

export default router;
