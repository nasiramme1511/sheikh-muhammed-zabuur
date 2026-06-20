import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { isCloudUrl } from '../lib/storage';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, beginner } = req.query;
    const where: any = {};
    if (category) where.categoryId = Number(category);
    if (beginner === 'true') where.isBeginner = true;

    const books = await prisma.book.findMany({
      where,
      orderBy: { title: 'asc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { lessons: true } },
      },
    });
    res.json(books);
  } catch {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// SECURE DOWNLOAD ENDPOINT
router.get('/download/:fileName', async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;

    // 1. Basic validation - only alphanumeric, dashes, dots
    if (!/^[a-zA-Z0-9-_\.]+$/.test(fileName)) {
      return res.status(400).json({ error: 'Invalid file name format' });
    }

    // 2. Prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({ error: 'Invalid file name' });
    }

    // 3. Ensure valid extension
    const validExtensions = ['.pdf', '.epub', '.docx'];
    const ext = path.extname(fileName).toLowerCase();
    if (!validExtensions.includes(ext)) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // 4. Construct secure path (resolves to server/uploads/pdfs)
    const filePath = path.join(__dirname, '../../uploads/pdfs', fileName);

    // 5. Check if file exists locally
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // 6. Force browser download using res.download (sets Content-Disposition)
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during download' });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const book = await prisma.book.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        lessons: {
          orderBy: { episodeNumber: 'asc' },
        },
      },
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

export default router;
