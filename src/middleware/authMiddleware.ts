import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.user = decoded as { userId: string; roleId: string; email: string };
    next();
  } catch (_err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'User not authenticated' });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.roleId !== '0001') return res.status(403).json({ error: 'Access Denied' });
  next();
};
