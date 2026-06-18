import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { isCloudUrl, getFileUrl } from '../lib/storage';

const router = Router();
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

router.use(authenticate);

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await prisma.resource.update({
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

    // If cloud URL, redirect to CDN for download
    if (isCloudUrl(resource.fileUrl)) {
      const url = getFileUrl(resource.fileUrl);
      // Cloudinary supports `fl_attachment` flag for forced download
      const downloadUrl = url.includes('cloudinary.com')
        ? url.replace('/upload/', '/upload/fl_attachment/')
        : url;
      return res.redirect(302, downloadUrl);
    }

    const relPath = resource.fileUrl.replace(/^\//, '');
    const absPath = path.join(UPLOAD_DIR, relPath.replace(/^uploads\//, ''));

    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    const filename = path.basename(absPath);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stat = fs.statSync(absPath);
    res.setHeader('Content-Length', stat.size);

    const stream = fs.createReadStream(absPath);
    stream.pipe(res);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Download failed' });
  }
});

router.post('/track/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await prisma.resource.update({
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

    res.json({ success: true, url: resource.fileUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track download' });
  }
});

export default router;
