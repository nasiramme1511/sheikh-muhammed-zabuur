import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/live/current
router.get('/current', async (_req: Request, res: Response) => {
  try {
    const stream = await prisma.liveStream.findFirst({
      where: { isLive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(stream || { isLive: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live stream' });
  }
});

// GET /api/live
router.get('/', async (_req: Request, res: Response) => {
  try {
    const stream = await prisma.liveStream.findFirst({
      where: { isLive: true },
      orderBy: { createdAt: 'desc' },
    });
    const schedule = await prisma.liveStream.findMany({
      where: { isLive: false, scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: 'asc' },
    });
    res.json({
      url: stream?.streamUrl || '',
      isActive: !!stream,
      title: stream?.title || '',
      chatUrl: '',
      youtubeChannelId: '',
      schedule: schedule.map(s => ({
        id: s.id.toString(),
        title: s.title,
        description: s.description,
        scheduledFor: s.scheduledAt?.toISOString() || '',
        status: 'upcoming' as const,
      })),
      viewerCount: stream?.viewerCount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live stream' });
  }
});

// POST /api/live/start
router.post('/start', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const { title, description, streamUrl, platform } = req.body;
    const stream = await prisma.liveStream.create({
      data: {
        title: title || 'Live Broadcast',
        description,
        streamUrl,
        platform: platform || 'youtube',
        isLive: true,
        viewerCount: 0,
        scheduledAt: new Date(),
      },
    });
    res.json(stream);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start live stream' });
  }
});

// POST /api/live/end
router.post('/end', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const activeStream = await prisma.liveStream.findFirst({
      where: { isLive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!activeStream) {
      return res.status(404).json({ error: 'No active live stream found' });
    }
    const { title, videoUrl, thumbnail } = req.body;
    // Save as recording
    await prisma.liveRecording.create({
      data: {
        title: title || activeStream.title,
        videoUrl: videoUrl || activeStream.streamUrl || '',
        thumbnail,
        recordedAt: new Date(),
      },
    });
    // End the stream
    const ended = await prisma.liveStream.update({
      where: { id: activeStream.id },
      data: { isLive: false },
    });
    res.json(ended);
  } catch (err) {
    res.status(500).json({ error: 'Failed to end live stream' });
  }
});

// GET /api/live/recordings
router.get('/recordings', async (_req: Request, res: Response) => {
  try {
    const recordings = await prisma.liveRecording.findMany({
      orderBy: { recordedAt: 'desc' },
    });
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

// POST /api/live/recordings
router.post('/recordings', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl, thumbnail, recordedAt } = req.body;
    const recording = await prisma.liveRecording.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnail,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
    });
    res.json(recording);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recording' });
  }
});

// DELETE /api/live/recordings/:id
router.delete('/recordings/:id', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.liveRecording.delete({ where: { id } });
    res.json({ message: 'Recording deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recording' });
  }
});

// Backward compatible: PUT /api/live (used by admin panel)
router.put('/', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const { url, isActive, title } = req.body;
    if (isActive) {
      const existing = await prisma.liveStream.findFirst({
        where: { isLive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        await prisma.liveStream.update({
          where: { id: existing.id },
          data: { streamUrl: url || existing.streamUrl, title: title || existing.title },
        });
      } else {
        await prisma.liveStream.create({
          data: {
            title: title || 'Live Broadcast',
            streamUrl: url || '',
            isLive: true,
          },
        });
      }
    } else {
      const active = await prisma.liveStream.findFirst({
        where: { isLive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (active) {
        await prisma.liveStream.update({
          where: { id: active.id },
          data: { isLive: false },
        });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update live stream' });
  }
});

export default router;
