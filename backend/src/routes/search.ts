import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim().length < 1) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const query = String(q).trim();

    // Query all matching resources
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Query matching Telegram channels
    const telegramChannels = await prisma.telegramChannel.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { teacherName: { contains: query } },
          { description: { contains: query } },
        ],
      },
      orderBy: { name: 'asc' },
    });

    // Group matching resources by category types
    const audio = resources.filter((r) => r.resourceType === 'AUDIO');
    const videos = resources.filter((r) => r.resourceType === 'VIDEO' && r.fileType !== 'recording');
    const pdfs = resources.filter((r) => r.resourceType === 'PDF');
    const recordings = resources.filter((r) => r.resourceType === 'VIDEO' && r.fileType === 'recording');

    res.json({ audio, videos, pdfs, recordings, telegramChannels });
  } catch (err) {
    console.error('Search failed:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
