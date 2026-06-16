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
  scheduledFor: string;
}

interface LivestreamState {
  url: string;
  isActive: boolean;
  title: string;
  chatUrl: string;
  schedule: UpcomingStream[];
}

const defaultState: LivestreamState = {
  url: '',
  isActive: false,
  title: 'Weekly Islamic Lecture',
  chatUrl: '',
  schedule: []
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
    const { url, isActive, title, chatUrl, schedule, collection } = req.body;
    const currentState = readState();
    const wasActive = currentState.isActive;

    if (url !== undefined) currentState.url = url;
    if (isActive !== undefined) currentState.isActive = !!isActive;
    if (title !== undefined) currentState.title = title;
    if (chatUrl !== undefined) currentState.chatUrl = chatUrl;
    if (schedule !== undefined && Array.isArray(schedule)) {
      currentState.schedule = schedule;
    }

    writeState(currentState);

    // Auto-save recording when stream ends
    if (wasActive && !currentState.isActive && currentState.url) {
      try {
        const finalTitle = title || currentState.title || 'Live Stream Recording';
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const existing = await prisma.resource.findFirst({
          where: { fileUrl: currentState.url, fileType: 'recording' },
        });
        if (!existing) {
          await prisma.resource.create({
            data: {
              title: `${finalTitle} (${dateStr})`,
              fileUrl: currentState.url,
              fileType: 'recording',
              resourceType: 'VIDEO',
              category: 'General Lectures',
              collection: collection || null,
              language: 'en',
              views: 0,
              downloads: 0,
            },
          });
        }
      } catch (recErr) {
        console.error('Failed to auto-save recording:', recErr);
      }
    }

    res.json(currentState);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update live stream details' });
  }
});

export default router;
