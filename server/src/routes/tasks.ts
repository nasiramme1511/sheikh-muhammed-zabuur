import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/tasks — retrieve all tasks for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [
        { status: 'asc' }, // pending first
        { dueDate: 'asc' }
      ]
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks — create custom task
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, description, dueDate, priority, type } = req.body;

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        type: type || 'LESSON',
      }
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id/complete — toggle/complete task
router.put('/:id/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId!;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== userId) return res.status(403).json({ error: 'Access denied: not your task' });

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
        updatedAt: new Date(),
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
});

export default router;
