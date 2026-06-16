import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/certificates/my-certificates — list certificates for student
router.get('/my-certificates', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const certificates = await prisma.certificate.findMany({
      where: { studentId: student.id },
      include: {
        course: { select: { id: true, title: true, slug: true, thumbnail: true } }
      },
      orderBy: { issueDate: 'desc' }
    });

    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// GET /api/certificates/verify/:code — public verification URL
router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        student: { include: { user: { select: { id: true, name: true, email: true } } } },
        course: { include: { teacher: { select: { id: true, name: true } } } }
      }
    });

    if (!certificate) {
      return res.status(404).json({ verified: false, error: 'Certificate not found or invalid' });
    }

    res.json({
      verified: true,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      teacherName: certificate.teacherName,
      issueDate: certificate.issueDate,
      verificationCode: certificate.verificationCode,
    });
  } catch (err) {
    res.status(500).json({ verified: false, error: 'Verification check failed' });
  }
});

export default router;
