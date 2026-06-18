import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.scholarProfile.findFirst();
    if (!profile) {
      return res.status(404).json({ error: 'Scholar profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scholar profile' });
  }
});

router.put('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.scholarProfile.findFirst();
    if (!existing) {
      const profile = await prisma.scholarProfile.create({ data: req.body });
      return res.json(profile);
    }
    const profile = await prisma.scholarProfile.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update scholar profile' });
  }
});

export default router;
