import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: number; role: string };
      req.userId = decoded.userId;
      req.userRole = decoded.role;
    } catch {
      // ignore invalid token
    }
  }
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.userRole;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Admin role required' });
  }
  next();
};

export const superAdminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Super Admin role required' });
  }
  next();
};
