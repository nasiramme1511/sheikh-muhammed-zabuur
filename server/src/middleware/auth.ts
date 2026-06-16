import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number; role: string };
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

export const studentOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.userRole;
  if (role !== 'STUDENT' && role !== 'TEACHER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Student role required' });
  }
  next();
};

export const teacherOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.userRole;
  if (role !== 'TEACHER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Teacher role required' });
  }
  next();
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

