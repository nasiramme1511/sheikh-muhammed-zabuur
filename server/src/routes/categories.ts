import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { lessons: true, books: true } } },
    });
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/beginner', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isBeginner: true },
      orderBy: { order: 'asc' },
      include: { _count: { select: { lessons: true } } },
    });
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Failed to fetch beginner categories' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        books: { take: 20, orderBy: { createdAt: 'desc' } },
        lessons: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: { teacher: { select: { id: true, name: true, image: true } } },
        },
        _count: { select: { lessons: true, books: true } },
      },
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;
