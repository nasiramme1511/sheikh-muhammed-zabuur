import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { uploadFile } from '../lib/storage';
import prisma from '../lib/prisma';

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `branding-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Invalid image type'));
    cb(null, true);
  },
});

// GET current branding settings
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch branding' });
  }
});

// PUT update branding settings (text fields)
router.put('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.siteSettings.findFirst();
    if (!existing) {
      const created = await prisma.siteSettings.create({ data: req.body });
      return res.json(created);
    }
    const updated = await prisma.siteSettings.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update branding' });
  }
});

// POST upload a branding image (logo, favicon, splash, hero, etc.)
router.post('/upload/:type', authenticate, adminOnly, (req: AuthRequest, res: Response) => {
  const allowedTypes = ['logo', 'favicon', 'splash', 'hero', 'social', 'banner', 'apple-icon', 'maskable-icon'];
  const type = req.params.type;
  if (!allowedTypes.includes(type)) return res.status(400).json({ error: 'Invalid branding type' });

  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const result = await uploadFile(req.file.path, req.file.originalname);
      try { fs.unlinkSync(req.file.path); } catch {}

      const fieldMap: Record<string, string> = {
        logo: 'logo',
        favicon: 'favicon',
        splash: 'splashScreen',
        hero: 'heroImage',
        social: 'socialShareImage',
        banner: 'dashboardBanner',
        'apple-icon': 'appleTouchIcon',
        'maskable-icon': 'pwaMaskableIcon',
      };

      const existing = await prisma.siteSettings.findFirst();
      if (!existing) {
        await prisma.siteSettings.create({ data: { [fieldMap[type]]: result.url } });
      } else {
        await prisma.siteSettings.update({
          where: { id: existing.id },
          data: { [fieldMap[type]]: result.url },
        });
      }

      res.json({ url: result.url });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Upload failed' });
    }
  });
});

export default router;
