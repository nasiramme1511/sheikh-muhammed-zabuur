import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const series = await prisma.series.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { lessons: true } },
        lessons: {
          orderBy: { episodeNumber: 'desc' },
          take: 1,
          select: { id: true, title: true, slug: true, episodeNumber: true, duration: true, createdAt: true },
        },
      },
    });
    const result = series.map(s => {
      const totalDuration = 0; // We'll compute this more efficiently later
      return {
        ...s,
        totalLessons: s._count.lessons,
        latestLesson: s.lessons[0] || null,
        _count: undefined,
        lessons: undefined,
      };
    });

    // Compute total duration
    const seriesWithDuration = await Promise.all(
      result.map(async (s) => {
        const agg = await prisma.lesson.aggregate({
          where: { seriesId: s.id },
          _sum: { duration: true },
        });
        return { ...s, totalDuration: agg._sum.duration || 0 };
      })
    );

    res.json(seriesWithDuration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 500;
    const search = req.query.search as string | undefined;
    const skip = (page - 1) * limit;

    const series = await prisma.series.findUnique({
      where: { slug },
    });
    if (!series) return res.status(404).json({ error: 'Series not found' });

    const where: any = { seriesId: series.id, published: true };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleAmharic: { contains: search } },
        { titleArabic: { contains: search } },
        { titleOromic: { contains: search } },
      ];
    }

    const [lessons, total, totalDurationAgg] = await Promise.all([
      prisma.lesson.findMany({
        where,
        orderBy: { episodeNumber: 'asc' },
        skip,
        take: limit,
        include: {
          series: { select: { id: true, name: true, slug: true, image: true } },
        },
      }),
      prisma.lesson.count({ where }),
      prisma.lesson.aggregate({
        where,
        _sum: { duration: true },
      }),
    ]);

    const totalDuration = totalDurationAgg._sum.duration || 0;

    res.json({
      series,
      lessons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      totalDuration,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

export default router;
