import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

router.use(authenticate);

// GET /api/analytics/student — student learning analytics
router.get('/student', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const [totalEnrollments, completedCourses, totalLessonProgress, completedLessons, quizAttempts, totalQuizzes, streak] = await Promise.all([
      prisma.enrollment.count({ where: { studentId: student.id } }),
      prisma.enrollment.count({ where: { studentId: student.id, completed: true } }),
      prisma.lessonProgress.count({ where: { userId } }),
      prisma.lessonProgress.count({ where: { userId, completed: true } }),
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.quizAttempt.count({ where: { userId, correct: true } }),
      prisma.usageLog.count({
        where: {
          userId,
          action: { contains: 'lesson' },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const completionRate = totalLessonProgress > 0 ? Math.round((completedLessons / totalLessonProgress) * 100) : 0;
    const quizAverage = quizAttempts > 0 ? Math.round((totalQuizzes / quizAttempts) * 100) : 0;

    res.json({
      totalEnrollments,
      completedCourses,
      completionRate,
      quizAverage,
      totalLessonsStarted: totalLessonProgress,
      completedLessons,
      quizAttempts,
      streak,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch student analytics' });
  }
});

// GET /api/analytics/teacher — teacher analytics
router.get('/teacher', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const [totalCourses, totalLessons, totalStudents, totalAssignments, totalSubmissions, pendingGrading, completionData] = await Promise.all([
      prisma.course.count({ where: { teacherId: teacher.id } }),
      prisma.lesson.count({ where: { teacherId: teacher.id } }),
      prisma.enrollment.count({
        where: { course: { teacherId: teacher.id } },
      }),
      prisma.assignment.count({
        where: { course: { teacherId: teacher.id } },
      }),
      prisma.submission.count({
        where: { assignment: { course: { teacherId: teacher.id } } },
      }),
      prisma.submission.count({
        where: {
          status: 'PENDING',
          assignment: { course: { teacherId: teacher.id } },
        },
      }),
      prisma.enrollment.aggregate({
        where: { course: { teacherId: teacher.id } },
        _avg: { progress: true },
      }),
    ]);

    const avgCompletion = completionData._avg.progress ? Math.round(completionData._avg.progress) : 0;

    res.json({
      teacherId: teacher.id,
      totalCourses,
      totalLessons,
      totalStudents,
      totalAssignments,
      totalSubmissions,
      pendingGrading,
      avgCompletion,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch teacher analytics' });
  }
});

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
