import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const [user, bookmarkCount, completedCount, inProgressCount, recentLogs, totalDownloads, lessonProgress] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, image: true, role: true, createdAt: true, updatedAt: true },
      }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.userProgress.count({ where: { userId, completed: true } }),
      prisma.userProgress.count({ where: { userId, completed: false } }),
      prisma.usageLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.usageLog.count({
        where: { userId, action: { contains: 'download' } },
      }),
      prisma.userProgress.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          lesson: {
            select: { id: true, title: true, slug: true, duration: true, audioUrl: true, videoUrl: true, pdfUrl: true },
          },
        },
      }),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const audioCount = recentLogs.filter(l => l.action === 'listen').length;
    const videoCount = recentLogs.filter(l => l.action === 'watch').length;
    const pdfCount = recentLogs.filter(l => l.action === 'read' || l.action === 'download_pdf').length;
    const downloadCount = recentLogs.filter(l => l.action === 'download').length;
    const liveCount = recentLogs.filter(l => l.action === 'live_join').length;

    const uniqueCategories = new Set<string>();
    lessonProgress.forEach(p => { if (p.lesson?.audioUrl) uniqueCategories.add('audio');
      if (p.lesson?.videoUrl) uniqueCategories.add('video');
      if (p.lesson?.pdfUrl) uniqueCategories.add('pdf'); });

    const achievements: Array<{ id: string; title: string; description: string; icon: string; earned: boolean }> = [
      { id: 'first_lesson', title: 'First Step', description: 'Completed your first lesson', icon: '🎯', earned: completedCount >= 1 },
      { id: 'ten_lessons', title: 'Dedicated Student', description: 'Completed 10 lessons', icon: '📚', earned: completedCount >= 10 },
      { id: 'fifty_lessons', title: 'Knowledge Seeker', description: 'Completed 50 lessons', icon: '🏆', earned: completedCount >= 50 },
      { id: 'hundred_lessons', title: 'Scholar in Training', description: 'Completed 100 lessons', icon: '👑', earned: completedCount >= 100 },
      { id: 'first_bookmark', title: 'Remember It', description: 'Saved your first bookmark', icon: '🔖', earned: bookmarkCount >= 1 },
      { id: 'ten_bookmarks', title: 'Curator', description: 'Saved 10 bookmarks', icon: '📑', earned: bookmarkCount >= 10 },
      { id: 'first_download', title: 'Collector', description: 'Downloaded your first resource', icon: '⬇️', earned: downloadCount >= 1 },
      { id: 'ten_downloads', title: 'Resourceful', description: 'Downloaded 10 resources', icon: '💾', earned: downloadCount >= 10 },
      { id: 'first_live', title: 'Live Attendee', description: 'Joined your first live stream', icon: '📡', earned: liveCount >= 1 },
      { id: 'multi_media', title: 'Multi-Media Learner', description: 'Used audio, video & PDF resources', icon: '🎓', earned: uniqueCategories.size >= 3 },
    ];

    res.json({
      user,
      stats: {
        audioListened: audioCount,
        videosWatched: videoCount,
        pdfsDownloaded: pdfCount,
        bookmarksSaved: bookmarkCount,
        totalDownloads: downloadCount + pdfCount,
        completedLessons: completedCount,
        inProgressLessons: inProgressCount,
        liveSessionsAttended: liveCount,
        streak: Math.min(completedCount, 30),
        studyHours: Math.floor((audioCount + videoCount) / 2),
      },
      achievements,
      continueLearning: lessonProgress,
      recentActivity: recentLogs.slice(0, 10),
      lastLogin: user.updatedAt,
      memberSince: user.createdAt,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/bookmarks', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        lesson: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    res.json(bookmarks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

router.get('/bookmarks/check/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const bookmark = await prisma.bookmark.findFirst({
      where: { userId: req.userId!, lessonId },
    });
    res.json({ bookmarked: !!bookmark });
  } catch {
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
});

router.post('/bookmarks/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const bookmark = await prisma.bookmark.create({
      data: { userId: req.userId!, lessonId },
    });
    res.status(201).json(bookmark);
  } catch {
    res.status(500).json({ error: 'Failed to bookmark' });
  }
});

router.delete('/bookmarks/:lessonId', async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.lessonId);
    await prisma.bookmark.deleteMany({
      where: { userId: req.userId!, lessonId },
    });
    res.json({ message: 'Bookmark removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

router.get('/downloads', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const logs = await prisma.usageLog.findMany({
      where: { userId, action: { in: ['download', 'download_pdf', 'download_audio', 'download_video'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const items = await Promise.all(logs.map(async (log) => {
      let lesson: any = null;
      let lessonId: number | undefined;
      let fileUrl: string | undefined;
      let fileSize: number | undefined;
      try {
        const meta = JSON.parse(log.metadata || '{}');
        lessonId = meta.resourceId || meta.lessonId;
        if (lessonId) {
          const resource = await prisma.resource.findUnique({ where: { id: lessonId } });
          if (resource) {
            lesson = { title: resource.title, description: resource.description };
            fileUrl = resource.fileUrl;
            fileSize = resource.fileSize || undefined;
          }
        }
      } catch { /* metadata not valid JSON */ }
      return {
        id: log.id,
        lessonId,
        lesson,
        fileUrl,
        fileSize,
        downloadedAt: log.createdAt.toISOString(),
      };
    }));
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

router.get('/activity', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const logs = await prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(logs);
  } catch {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

router.get('/recommended', async (req: AuthRequest, res: Response) => {
  try {
    const recent = await prisma.lesson.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    res.json(recent);
  } catch {
    res.status(500).json({ error: 'Failed to fetch recommended' });
  }
});

router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, email, image } = req.body;
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, image },
      select: { id: true, email: true, name: true, image: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/password', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;
