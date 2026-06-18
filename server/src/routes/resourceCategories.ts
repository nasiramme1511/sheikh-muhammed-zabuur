import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import path from 'path';
import fs from 'fs';

const router = Router();
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const CATEGORIES = [
  { name: 'Tafsir', slug: 'tafsir' },
  { name: 'Hadith', slug: 'hadith' },
  { name: 'Riyadus Salihin', slug: 'riyadus-salihin' },
  { name: 'Tajweed', slug: 'tajweed' },
  { name: 'Usul al-Fiqh', slug: 'usul-al-fiqh' },
  { name: 'Fiqh', slug: 'fiqh' },
  { name: 'Seerah', slug: 'seerah' },
  { name: 'Aqeedah', slug: 'aqeedah' },
  { name: 'Arabic Language', slug: 'arabic' },
  { name: 'Manhaj', slug: 'manhaj' },
  { name: 'Adab', slug: 'adab' },
  { name: "Da'wah", slug: 'dawah' },
  { name: 'Khutbah', slug: 'khutbah' },
  { name: 'Ramadan Series', slug: 'ramadan-series' },
  { name: 'Questions & Answers', slug: 'questions-answers' },
  { name: 'General Lectures', slug: 'general-lectures' },
];

router.get('/', async (_req: Request, res: Response) => {
  try {
    const counts = await Promise.all(
      CATEGORIES.map(async (cat) => {
    const [audio, video, pdfs, recordings, images, total] = await Promise.all([
      prisma.resource.count({ where: { category: cat.name, resourceType: 'AUDIO' } }),
      prisma.resource.count({ where: { category: cat.name, resourceType: 'VIDEO', fileType: { not: 'recording' } } }),
      prisma.resource.count({ where: { category: cat.name, resourceType: 'PDF' } }),
      prisma.resource.count({ where: { category: cat.name, resourceType: 'VIDEO', fileType: 'recording' } }),
      prisma.resource.count({ where: { category: cat.name, resourceType: 'IMAGE' } }),
      prisma.resource.count({ where: { category: cat.name } }),
    ]);
    return { ...cat, audio, video, pdfs, recordings, images, total };
      })
    );
    res.json(counts);
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const cat = CATEGORIES.find(c => c.slug === slug);
    if (!cat) return res.status(404).json({ error: 'Category not found' });

    const type = req.query.type as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { category: cat.name };
      if (type && type !== 'all') {
      if (type === 'recordings') {
        where.resourceType = 'VIDEO';
        where.fileType = 'recording';
      } else if (type === 'audio') {
        where.resourceType = 'AUDIO';
      } else if (type === 'video') {
        where.resourceType = 'VIDEO';
        where.fileType = { not: 'recording' };
      } else if (type === 'pdf') {
        where.resourceType = 'PDF';
      } else if (type === 'image') {
        where.resourceType = 'IMAGE';
      }
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          book: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.resource.count({ where }),
    ]);

    const results = resources.map((r) => {
      let size = 0;
      if (r.fileUrl.startsWith('/uploads/')) {
        try {
          const fp = path.join(UPLOAD_DIR, r.fileUrl.replace('/uploads/', ''));
          if (fs.existsSync(fp)) size = fs.statSync(fp).size;
        } catch {}
      }
      return { ...r, size, name: r.fileUrl.split('/').pop() || 'resource' };
    });

    const [audio, video, pdfs, recordings, images] = await Promise.all([
      prisma.resource.count({ where: { category: cat.name, resourceType: 'AUDIO' } }),
      prisma.resource.count({ where: { category: cat.name, resourceType: 'VIDEO', fileType: { not: 'recording' } } }),
      prisma.resource.count({ where: { category: cat.name, resourceType: 'PDF' } }),
      prisma.resource.count({ where: { category: cat.name, resourceType: 'VIDEO', fileType: 'recording' } }),
      prisma.resource.count({ where: { category: cat.name, resourceType: 'IMAGE' } }),
    ]);

    res.json({
      category: cat,
      stats: { audio, video, pdfs, recordings, images, total: audio + video + pdfs + recordings + images },
      items: results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch category resources' });
  }
});

export default router;
