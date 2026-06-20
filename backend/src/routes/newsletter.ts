import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, language = 'en' } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Invalid email address' });
      return;
    }

    const existing = await prisma.subscriber.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      if (!existing.active) {
        await prisma.subscriber.update({
          where: { id: existing.id },
          data: { active: true, language },
        });
        res.json({ message: 'Subscription reactivated. Welcome back!' });
        return;
      }
      res.status(200).json({ message: 'You\'re already subscribed!' });
      return;
    }

    await prisma.subscriber.create({
      data: {
        email: email.trim().toLowerCase(),
        language: ['en', 'ar', 'am', 'om'].includes(language) ? language : 'en',
      },
    });

    res.status(201).json({ message: 'Successfully subscribed! Check your inbox.' });
  } catch {
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

export default router;
