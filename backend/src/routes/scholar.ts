import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { uploadFile } from '../lib/storage';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.scholarProfile.findFirst();
    if (!profile) return res.status(404).json({ error: 'Scholar profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scholar profile' });
  }
});

router.put('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.scholarProfile.findFirst();
    if (!existing) {
      const profile = await prisma.scholarProfile.create({ data: req.body });
      return res.json(profile);
    }
    const profile = await prisma.scholarProfile.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update scholar profile' });
  }
});

router.post('/upload/:type', authenticate, adminOnly, (req: AuthRequest, res: Response) => {
  const scholarUpload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        const dir = path.join(__dirname, '../../uploads/images');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => cb(null, `scholar-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(new Error('Only JPG, PNG, WebP allowed'));
      cb(null, true);
    },
  }).single('file');

  scholarUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const result = await uploadFile(req.file.path, req.file.originalname);
      try { fs.unlinkSync(req.file.path); } catch {}
      const field = req.params.type === 'cover' ? 'coverImage' : 'profileImage';
      const existing = await prisma.scholarProfile.findFirst();
      if (!existing) {
        await prisma.scholarProfile.create({ data: { name: '', [field]: result.url } });
      } else {
        await prisma.scholarProfile.update({ where: { id: existing.id }, data: { [field]: result.url } });
      }
      res.json({ url: result.url });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Upload failed' });
    }
  });
});

export default router;
