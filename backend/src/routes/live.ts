import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

const router = Router();

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const LIVESTREAM_FILE = path.join(DATA_DIR, 'livestream.json');

interface UpcomingStream {
  id: string;
  title: string;
  description?: string;
  youtubeUrl?: string;
  scheduledFor: string;
  startDate?: string;
  duration?: number;
  status?: 'upcoming' | 'live' | 'ended';
  category?: string;
  collection?: string;
  seriesId?: number | null;
}

interface LivestreamState {
  url: string;
  isActive: boolean;
  title: string;
  chatUrl: string;
  youtubeChannelId: string;
  schedule: UpcomingStream[];
  viewers: number;
  totalViewers: number;
  totalStreams: number;
  totalWatchHours: number;
  activeSubscribers: number;
}

const defaultState: LivestreamState = {
  url: '',
  isActive: false,
  title: 'Weekly Islamic Lecture',
  chatUrl: '',
  youtubeChannelId: '',
  schedule: [],
  viewers: 0,
  totalViewers: 0,
  totalStreams: 0,
  totalWatchHours: 0,
  activeSubscribers: 0,
};

function readState(): LivestreamState {
  try {
    if (fs.existsSync(LIVESTREAM_FILE)) {
      const data = fs.readFileSync(LIVESTREAM_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading livestream state:', err);
  }
  return defaultState;
}

function writeState(state: LivestreamState) {
  try {
    fs.writeFileSync(LIVESTREAM_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing livestream state:', err);
  }
}

// GET /api/live
router.get('/', (_req: Request, res: Response) => {
  res.json(readState());
});

// PUT /api/live
router.put('/', authenticate, adminOnly, async (req: Request, res: Response) => {
  try {
    const { url, isActive, title, chatUrl, youtubeChannelId, schedule, collection, seriesId, viewers, totalViewers, totalStreams, totalWatchHours, activeSubscribers } = req.body;
    const currentState = readState();
    const wasActive = currentState.isActive;

    if (url !== undefined) currentState.url = url;
    if (isActive !== undefined) currentState.isActive = !!isActive;
    if (title !== undefined) currentState.title = title;
    if (chatUrl !== undefined) currentState.chatUrl = chatUrl;
    if (youtubeChannelId !== undefined) currentState.youtubeChannelId = youtubeChannelId;
    if (schedule !== undefined && Array.isArray(schedule)) {
      currentState.schedule = schedule;
    }
    if (viewers !== undefined) currentState.viewers = viewers;
    if (totalViewers !== undefined) currentState.totalViewers = totalViewers;
    if (totalStreams !== undefined) currentState.totalStreams = totalStreams;
    if (totalWatchHours !== undefined) currentState.totalWatchHours = totalWatchHours;
    if (activeSubscribers !== undefined) currentState.activeSubscribers = activeSubscribers;

    // Track analytics: increment totalStreams when going live
    if (!wasActive && currentState.isActive) {
      currentState.totalStreams = (currentState.totalStreams || 0) + 1;
    }

    writeState(currentState);

    // Auto-save recording when stream ends
    let savedRecordingUrl = '';
    if (wasActive && !currentState.isActive && currentState.url) {
      try {
        const finalTitle = title || currentState.title || 'Live Stream Recording';
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const existing = await prisma.resource.findFirst({
          where: { fileUrl: currentState.url, fileType: 'recording' },
        });
        if (!existing) {
          const seriesIdNum = seriesId ? parseInt(seriesId, 10) : null;
          const rec = await prisma.resource.create({
            data: {
              title: `${finalTitle} (${dateStr})`,
              fileUrl: currentState.url,
              fileType: 'recording',
              resourceType: 'VIDEO',
              category: 'General Lectures',
              collection: collection || null,
              seriesId: seriesIdNum,
              language: 'en',
              views: 0,
              downloads: 0,
            },
          });
          savedRecordingUrl = rec.fileUrl;

          // Auto-create Lesson for recordings with a seriesId
          if (seriesIdNum) {
            const slugBase = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
            const maxEp = await prisma.lesson.aggregate({ where: { seriesId: seriesIdNum }, _max: { episodeNumber: true } });
            const episodeNumber = (maxEp._max.episodeNumber ?? 0) + 1;
            await prisma.lesson.create({
              data: {
                title: `${finalTitle} (${dateStr})`,
                slug: slugBase,
                audioUrl: '',
                videoUrl: currentState.url,
                seriesId: seriesIdNum,
                episodeNumber,
                published: true,
              },
            });
          }
        }
      } catch (recErr) {
        console.error('Failed to auto-save recording:', recErr);
      }
    }

    // Auto-mark scheduled streams as ended when stream ends
    if (wasActive && !currentState.isActive) {
      currentState.schedule = currentState.schedule.map(s => {
        if (s.status === 'live') return { ...s, status: 'ended' as const };
        return s;
      });
      writeState(currentState);
    }

    // Mark scheduled streams as live when starting
    if (!wasActive && currentState.isActive) {
      currentState.schedule = currentState.schedule.map(s => {
        if (s.status === 'upcoming') {
          const schedDate = s.scheduledFor || s.startDate;
          if (schedDate) {
            const diff = Math.abs(new Date().getTime() - new Date(schedDate).getTime());
            if (diff < 3600000) return { ...s, status: 'live' as const };
          }
        }
        return s;
      });
      writeState(currentState);
    }

    res.json({ ...currentState, savedRecording: savedRecordingUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update live stream details' });
  }
});

export default router;
