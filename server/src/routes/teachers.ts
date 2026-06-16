import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { lessons: true } } },
    });
    res.json(teachers);
  } catch {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { slug: req.params.slug },
      include: {
        lessons: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
        books: true,
        _count: { select: { lessons: true } },
      },
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

export default router;
