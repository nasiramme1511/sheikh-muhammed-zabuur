import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const q = ((req.query.search as string) || (req.query.q as string) || '').trim();
    const { category, language, featured, teacherId, bookId, resourceType, collection } = req.query;
    const type = (resourceType || req.query.type) as string | undefined;

    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { author: { contains: q } },
        { book: { title: { contains: q } } },
      ];
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      where.category = String(category);
    }

    if (language) {
      where.language = String(language);
    }

    if (type && type.toLowerCase() !== 'all' && type.toLowerCase() !== 'all types') {
      const upper = type.toUpperCase();
      if (['PDF', 'AUDIO', 'VIDEO', 'IMAGE'].includes(upper)) {
        where.resourceType = upper;
      } else {
        where.fileType = type.toLowerCase();
      }
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (teacherId && teacherId !== 'All Teachers' && teacherId !== 'all') {
      const tid = Number(teacherId);
      if (!isNaN(tid)) {
      }
    }

    if (bookId && bookId !== 'All Books' && bookId !== 'all') {
      const bid = Number(bookId);
      if (!isNaN(bid)) {
        where.bookId = bid;
      }
    }

    if (collection) {
      where.collection = String(collection);
    }

    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const hasPaging = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    const resources = await prisma.resource.findMany({
      where,
      include: {
        book: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      ...(hasPaging ? {
        skip: (page - 1) * limit,
        take: limit,
      } : {}),
    });

    const results = resources.map((r) => {
      const relPath = r.fileUrl.replace(/^\//, '');
      const absPath = path.join(UPLOAD_DIR, relPath.replace(/^uploads\//, ''));
      let size = 0;
      try {
        if (fs.existsSync(absPath)) size = fs.statSync(absPath).size;
      } catch { /* ignore */ }
      return {
        id: r.id,
        name: r.fileUrl.split('/').pop() || 'resource',
        title: r.title,
        description: r.description,
        category: r.category,
        collection: r.collection,
        language: r.language,
        author: r.author,
        url: r.fileUrl,
        size,
        sizeHuman: humanSize(size),
        fileType: r.fileType,
        resourceType: r.resourceType,
        type: r.resourceType.toLowerCase(),
        createdAt: r.createdAt.toISOString(),
        featured: r.featured,
        downloads: r.downloads,
        views: r.views,
        book: r.book,
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list resources' });
  }
});

// GET /api/resources/popular — most downloaded resources
router.get('/popular', async (_req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { downloads: 'desc' },
      take: 10,
      include: {
        book: { select: { id: true, title: true, slug: true } },
      },
    });

    const results = resources.map((r) => {
      const relPath = r.fileUrl.replace(/^\//, '');
      const absPath = path.join(UPLOAD_DIR, relPath.replace(/^uploads\//, ''));
      let size = 0;
      try {
        if (fs.existsSync(absPath)) size = fs.statSync(absPath).size;
      } catch { /* ignore */ }
      return {
        id: r.id,
        name: r.fileUrl.split('/').pop() || 'resource',
        title: r.title,
        description: r.description,
        category: r.category,
        collection: r.collection,
        language: r.language,
        author: r.author,
        url: r.fileUrl,
        size,
        sizeHuman: humanSize(size),
        fileType: r.fileType,
        resourceType: r.resourceType,
        type: r.resourceType.toLowerCase(),
        createdAt: r.createdAt.toISOString(),
        featured: r.featured,
        downloads: r.downloads,
        views: r.views,
        book: r.book,
      };
    });

    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to fetch popular resources' });
  }
});

// GET /api/resources/recent — most recently added resources
router.get('/recent', async (_req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        book: { select: { id: true, title: true, slug: true } },
      },
    });

    const results = resources.map((r) => {
      const relPath = r.fileUrl.replace(/^\//, '');
      const absPath = path.join(UPLOAD_DIR, relPath.replace(/^uploads\//, ''));
      let size = 0;
      try {
        if (fs.existsSync(absPath)) size = fs.statSync(absPath).size;
      } catch { /* ignore */ }
      return {
        id: r.id,
        name: r.fileUrl.split('/').pop() || 'resource',
        title: r.title,
        description: r.description,
        category: r.category,
        collection: r.collection,
        language: r.language,
        author: r.author,
        url: r.fileUrl,
        size,
        sizeHuman: humanSize(size),
        fileType: r.fileType,
        resourceType: r.resourceType,
        type: r.resourceType.toLowerCase(),
        createdAt: r.createdAt.toISOString(),
        featured: r.featured,
        downloads: r.downloads,
        views: r.views,
        book: r.book,
      };
    });

    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to fetch recent resources' });
  }
});

// GET /api/resources/stats — aggregate counts by type
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [audio, video, pdf, image] = await Promise.all([
      prisma.resource.count({ where: { resourceType: 'AUDIO' } }),
      prisma.resource.count({ where: { resourceType: 'VIDEO' } }),
      prisma.resource.count({ where: { resourceType: 'PDF' } }),
      prisma.resource.count({ where: { resourceType: 'IMAGE' } }),
    ]);
    res.json({ audio, video, pdf, image, total: audio + video + pdf + image });
  } catch {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// GET /api/resources/featured — featured resources
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        book: { select: { id: true, title: true, slug: true } },
      },
    });

    const results = resources.map((r) => {
      const relPath = r.fileUrl.replace(/^\//, '');
      const absPath = path.join(UPLOAD_DIR, relPath.replace(/^uploads\//, ''));
      let size = 0;
      try {
        if (fs.existsSync(absPath)) size = fs.statSync(absPath).size;
      } catch { /* ignore */ }
      return {
        id: r.id,
        name: r.fileUrl.split('/').pop() || 'resource',
        title: r.title,
        description: r.description,
        category: r.category,
        collection: r.collection,
        language: r.language,
        author: r.author,
        url: r.fileUrl,
        size,
        sizeHuman: humanSize(size),
        fileType: r.fileType,
        resourceType: r.resourceType,
        type: r.resourceType.toLowerCase(),
        createdAt: r.createdAt.toISOString(),
        featured: r.featured,
        downloads: r.downloads,
        views: r.views,
        book: r.book,
      };
    });

    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to fetch featured resources' });
  }
});

// POST /api/resources/:id/download — increment download count (authenticated)
router.post('/:id/download', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const resource = await prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
    await prisma.usageLog.create({
      data: {
        userId: req.userId!,
        action: 'download',
        metadata: JSON.stringify({ resourceId: id, resourceType: resource.resourceType, title: resource.title }),
      },
    });
    res.json({ downloads: resource.downloads });
  } catch {
    res.status(400).json({ error: 'Failed to track download' });
  }
});

// POST /api/resources/:id/view — increment view count (authenticated)
router.post('/:id/view', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const resource = await prisma.resource.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    await prisma.usageLog.create({
      data: {
        userId: req.userId!,
        action: 'view',
        metadata: JSON.stringify({ resourceId: id, resourceType: resource.resourceType, title: resource.title }),
      },
    });
    res.json({ views: resource.views });
  } catch {
    res.status(400).json({ error: 'Failed to track view' });
  }
});

// GET /api/resources/collections/stats — resource count per collection
router.get('/collections/stats', async (_req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { collection: { not: null } },
      select: { collection: true, resourceType: true },
    });
    const stats: Record<string, { total: number; audio: number; video: number; pdf: number }> = {};
    for (const r of resources) {
      const col = r.collection!;
      if (!stats[col]) stats[col] = { total: 0, audio: 0, video: 0, pdf: 0 };
      stats[col].total++;
      if (r.resourceType === 'AUDIO') stats[col].audio++;
      else if (r.resourceType === 'VIDEO') stats[col].video++;
      else if (r.resourceType === 'PDF') stats[col].pdf++;
    }
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to get collection stats' });
  }
});

// GET /api/resources/collections/:slug — resources for a collection
router.get('/collections/:slug', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const where: any = { collection: req.params.slug };
    if (type && type !== 'all') {
      const upper = String(type).toUpperCase();
      if (['AUDIO', 'VIDEO', 'PDF'].includes(upper)) {
        where.resourceType = upper;
      }
    }
    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        book: { select: { id: true, title: true, slug: true } },
      },
    });
    const results = resources.map((r) => {
      const relPath = r.fileUrl.replace(/^\//, '');
      const absPath = path.join(UPLOAD_DIR, relPath.replace(/^uploads\//, ''));
      let size = 0;
      try {
        if (fs.existsSync(absPath)) size = fs.statSync(absPath).size;
      } catch { /* ignore */ }
      return {
        id: r.id,
        name: r.fileUrl.split('/').pop() || 'resource',
        title: r.title,
        description: r.description,
        category: r.category,
        collection: r.collection,
        language: r.language,
        author: r.author,
        url: r.fileUrl,
        size,
        sizeHuman: humanSize(size),
        fileType: r.fileType,
        resourceType: r.resourceType,
        type: r.resourceType.toLowerCase(),
        createdAt: r.createdAt.toISOString(),
        featured: r.featured,
        downloads: r.downloads,
        views: r.views,
        book: r.book,
      };
    });
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to fetch collection resources' });
  }
});

export default router;
