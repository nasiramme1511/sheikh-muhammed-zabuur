import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, studentOnly, teacherOnly } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/assignments/course/:courseId — list course assignments
router.get('/course/:courseId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// POST /api/assignments — create assignment (teachers/admins)
router.post('/', authenticate, teacherOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, title, description, fileUrl, dueDate } = req.body;

    const assignment = await prisma.assignment.create({
      data: {
        courseId: Number(courseId),
        title,
        description,
        fileUrl,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { course: true }
    });

    // Create tasks for students enrolled in the course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: Number(courseId) },
      include: { student: true },
    });

    for (const enrollment of enrollments) {
      await prisma.task.create({
        data: {
          userId: enrollment.student.userId,
          title: `Submit Assignment: ${title}`,
          description: `Assignment for course "${assignment.course.title}". Due date: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}.`,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority: 'HIGH',
          status: 'PENDING',
          type: 'ASSIGNMENT',
        }
      });

      await prisma.notification.create({
        data: {
          userId: enrollment.student.userId,
          title: 'New Assignment Assigned',
          body: `New assignment "${title}" has been posted in "${assignment.course.title}".`,
        }
      });
    }

    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create assignment' });
  }
});

// POST /api/assignments/:id/submit — submit assignment (students)
router.post('/:id/submit', authenticate, studentOnly, async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.userId!;
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'fileUrl is required' });
    }

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    // Upsert submission
    const existing = await prisma.submission.findFirst({
      where: { assignmentId, studentId: student.id }
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: { fileUrl, status: 'PENDING', gradedAt: null, score: null, feedback: null },
      });
    } else {
      submission = await prisma.submission.create({
        data: { assignmentId, studentId: student.id, fileUrl, status: 'PENDING' },
      });
    }

    // Mark assignment task as completed for student
    await prisma.task.updateMany({
      where: { userId, type: 'ASSIGNMENT', title: { contains: assignment.title } },
      data: { status: 'COMPLETED' },
    });

    // Create grading task for teacher
    if (assignment.course.teacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { id: assignment.course.teacherId } });
      if (teacher && teacher.userId) {
        await prisma.task.create({
          data: {
            userId: teacher.userId,
            title: `Grade Submission: ${assignment.title}`,
            description: `Grade assignment submission from student "${req.body.studentName || 'Student'}".`,
            priority: 'MEDIUM',
            status: 'PENDING',
            type: 'REVIEW',
          }
        });
      }
    }

    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ error: 'Submission failed' });
  }
});

// GET /api/assignments/my-submissions — student view submissions
router.get('/my-submissions', authenticate, studentOnly, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const submissions = await prisma.submission.findMany({
      where: { studentId: student.id },
      include: { assignment: { include: { course: true } } },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET /api/assignments/submissions/pending — teacher view all pending submissions across courses
router.get('/submissions/pending', authenticate, teacherOnly, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const submissions = await prisma.submission.findMany({
      where: {
        status: 'PENDING',
        assignment: {
          course: { teacherId: teacher.id }
        }
      },
      include: {
        student: { include: { user: { select: { id: true, name: true, email: true } } } },
        assignment: { include: { course: { select: { id: true, title: true } } } }
      },
      orderBy: { submittedAt: 'desc' },
      take: 20,
    });

    const mapped = submissions.map((s) => ({
      id: s.id,
      studentName: s.student?.user?.name || 'Student',
      assignmentTitle: s.assignment?.title || 'Assignment',
      courseTitle: s.assignment?.course?.title || 'Course',
      submittedAt: s.submittedAt,
      status: s.status,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending submissions' });
  }
});

// GET /api/assignments/submissions/:assignmentId — teacher view all submissions
router.get('/submissions/:assignmentId', authenticate, teacherOnly, async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = Number(req.params.assignmentId);
    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: { include: { user: { select: { id: true, name: true, email: true } } } }
      },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// POST /api/assignments/submissions/:id/grade — grade submission
router.post('/submissions/:id/grade', authenticate, teacherOnly, async (req: AuthRequest, res: Response) => {
  try {
    const submissionId = Number(req.params.id);
    const { status, score, feedback } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        assignment: { include: { course: true } },
      }
    });

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status, // APPROVED, REJECTED, REVISION
        score: score !== undefined ? Number(score) : null,
        feedback,
        gradedAt: new Date(),
      }
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: submission.student.userId,
        title: `Assignment Graded: ${submission.assignment.title}`,
        body: `Your submission has been reviewed by the teacher. Status: ${status}. Score: ${score || 'N/A'}/100. Feedback: ${feedback || 'None'}`,
      }
    });

    // Mark grading review task as completed for teacher
    await prisma.task.updateMany({
      where: {
        userId: req.userId!,
        type: 'REVIEW',
        title: { contains: submission.assignment.title }
      },
      data: { status: 'COMPLETED' },
    });

    // If revision requested, create task for student to revise
    if (status === 'REVISION') {
      await prisma.task.create({
        data: {
          userId: submission.student.userId,
          title: `Revise Assignment: ${submission.assignment.title}`,
          description: `Teacher requested revision for assignment. Feedback: ${feedback || 'None'}`,
          priority: 'HIGH',
          status: 'PENDING',
          type: 'ASSIGNMENT',
        }
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to grade submission' });
  }
});

export default router;
