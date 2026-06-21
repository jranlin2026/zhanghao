import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../config/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ code: 401, data: null, message: '未提供认证令牌' });
    return;
  }

  try {
    const payload = verifyToken(authHeader.slice(7));
    req.user = {
      id: payload.userId,
      name: payload.name,
      roles: payload.roles,
    };
    next();
  } catch {
    res.status(401).json({ code: 401, data: null, message: '认证令牌无效或已过期' });
  }
}
