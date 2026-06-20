import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

router.use(authenticate);

// GET /api/analytics/admin — admin platform analytics
router.get('/admin', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    const [
      totalUsers,
      totalAdmins,
      totalResources,
      totalAudio,
      totalVideo,
      totalPdf,
      totalRecordings,
      aggregates,
      allResources,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.resource.count(),
      prisma.resource.count({ where: { resourceType: 'AUDIO' } }),
      prisma.resource.count({
        where: {
          resourceType: 'VIDEO',
          fileType: { not: 'recording' },
        },
      }),
      prisma.resource.count({ where: { resourceType: 'PDF' } }),
      prisma.resource.count({
        where: {
          resourceType: 'VIDEO',
          fileType: 'recording',
        },
      }),
      prisma.resource.aggregate({
        _sum: {
          views: true,
          downloads: true,
        },
      }),
      prisma.resource.findMany({
        select: { fileUrl: true },
      }),
    ]);

    // Calculate total storage of local files
    let totalStorage = 0;
    for (const r of allResources) {
      if (r.fileUrl.startsWith('/uploads/')) {
        try {
          const relativePath = r.fileUrl.replace('/uploads/', '');
          const filePath = path.join(uploadDir, relativePath);
          if (fs.existsSync(filePath)) {
            totalStorage += fs.statSync(filePath).size;
          }
        } catch {}
      }
    }

    res.json({
      totalUsers,
      totalAdmins,
      totalResources,
      totalAudio,
      totalVideo,
      totalPdf,
      totalRecordings,
      totalViews: aggregates._sum.views || 0,
      totalDownloads: aggregates._sum.downloads || 0,
      totalStorage,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

export default router;
