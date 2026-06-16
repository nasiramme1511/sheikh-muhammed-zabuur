import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, studentOnly, teacherOnly, adminOnly } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to generate verification code
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ICC-${new Date().getFullYear()}-${rand}`;
}

// GET /api/courses — public listing
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, levelId, teacherId, language, search, status } = req.query;

    const where: any = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (levelId) where.levelId = Number(levelId);
    if (teacherId) where.teacherId = Number(teacherId);
    if (language) where.language = String(language);
    
    // Admins/teachers can see all courses; guests/students only published
    if (status) {
      where.status = String(status);
    } else {
      where.status = 'PUBLISHED';
    }

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        teacher: { select: { id: true, name: true, image: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        level: { select: { id: true, name: true, slug: true } },
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/my-enrollments — student enrolled courses
router.get('/my-enrollments', authenticate, studentOnly, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Find student
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          include: {
            teacher: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            _count: { select: { lessons: true } },
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// GET /api/courses/:slug — course details with modules & lessons
router.get('/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        teacher: true,
        category: true,
        level: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { published: true },
              orderBy: { episodeNumber: 'asc' },
            }
          }
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course detail' });
  }
});

// POST /api/courses — create a course
router.post('/', authenticate, teacherOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, thumbnail, description, categoryId, levelId, language, duration } = req.body;
    
    // Check slug uniqueness
    const exists = await prisma.course.findUnique({ where: { slug } });
    if (exists) {
      return res.status(400).json({ error: 'Course slug already exists' });
    }

    let teacherId = null;
    if (req.userRole === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.userId } });
      if (!teacher) return res.status(403).json({ error: 'Teacher profile not found' });
      teacherId = teacher.id;
    } else {
      teacherId = req.body.teacherId ? Number(req.body.teacherId) : null;
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        thumbnail,
        description,
        teacherId,
        categoryId: categoryId ? Number(categoryId) : null,
        levelId: levelId ? Number(levelId) : null,
        language: language || 'en',
        duration: duration ? Number(duration) : null,
        status: 'DRAFT',
      },
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create course' });
  }
});

// PUT /api/courses/:id — update a course
router.put('/:id', authenticate, teacherOnly, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Course not found' });

    // Validate authorization if teacher
    if (req.userRole === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.userId } });
      if (!teacher || existing.teacherId !== teacher.id) {
        return res.status(403).json({ error: 'Access denied: not your course' });
      }
    }

    const { title, slug, thumbnail, description, categoryId, levelId, language, duration, status } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        slug,
        thumbnail,
        description,
        categoryId: categoryId ? Number(categoryId) : null,
        levelId: levelId ? Number(levelId) : null,
        language,
        duration: duration ? Number(duration) : null,
        status,
      },
    });

    res.json(course);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update course' });
  }
});

// POST /api/courses/enroll/:id — enroll in course
router.post('/enroll/:id', authenticate, studentOnly, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const userId = req.userId!;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const exists = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: student.id, courseId }
      }
    });

    if (exists) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId: student.id, courseId },
    });

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to enroll' });
  }
});

// POST /api/courses/lessons/:id/complete — set/toggle lesson completion
router.post('/lessons/:id/complete', authenticate, studentOnly, async (req: AuthRequest, res: Response) => {
  try {
    const lessonId = Number(req.params.id);
    const userId = req.userId!;
    const { completed = true, watchPercentage = 100 } = req.body;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true }
    });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Update lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed, watchPercentage, completedAt: completed ? new Date() : null },
      create: { userId, lessonId, completed, watchPercentage, completedAt: completed ? new Date() : null },
    });

    // Recalculate Course progress if lesson is part of a course
    if (lesson.courseId) {
      const student = await prisma.student.findUnique({ where: { userId } });
      if (student) {
        const totalLessons = await prisma.lesson.count({ where: { courseId: lesson.courseId, published: true } });
        
        // Count completed lessons in this course
        const completedLessons = await prisma.lessonProgress.count({
          where: {
            userId,
            completed: true,
            lesson: { courseId: lesson.courseId }
          }
        });

        const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        const courseCompleted = progressPercent >= 100;

        const enrollment = await prisma.enrollment.findUnique({
          where: { studentId_courseId: { studentId: student.id, courseId: lesson.courseId } }
        });

        if (enrollment) {
          const updatedEnrollment = await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
              progress: progressPercent,
              completed: courseCompleted,
              completedAt: courseCompleted && !enrollment.completed ? new Date() : enrollment.completedAt,
            }
          });

          // Generate certificate automatically if just completed
          if (courseCompleted && !enrollment.completed) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            const teacher = lesson.course?.teacherId
              ? await prisma.teacher.findUnique({ where: { id: lesson.course.teacherId } })
              : null;

            await prisma.certificate.create({
              data: {
                studentId: student.id,
                courseId: lesson.courseId,
                studentName: user?.name || 'Student',
                courseName: lesson.course?.title || 'Islamic Course',
                teacherName: teacher?.name || 'Instructor',
                verificationCode: generateVerificationCode(),
              }
            });

            // Create system task/notification
            await prisma.notification.create({
              data: {
                userId,
                title: 'Certificate Issued! 🎉',
                body: `Congratulations! You have completed the course "${lesson.course?.title}" and your certificate is ready.`,
              }
            });
          }
        }
      }
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record progress' });
  }
});

// POST /api/courses/:courseId/modules — create a module
router.post('/:courseId/modules', authenticate, teacherOnly, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);
    const { title, description, order } = req.body;

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        description,
        order: order ? Number(order) : 0,
      }
    });

    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create module' });
  }
});

// DELETE /api/courses/:id — delete a course
router.delete('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
