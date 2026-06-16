import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from './auth';

export const requireTelegramAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { newsletterSubscribed: true } });
    if (!user || !user.newsletterSubscribed) {
      return res.status(403).json({ success: false, message: 'Telegram access requires active subscription.' });
    }
    next();
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to verify access' });
  }
};
