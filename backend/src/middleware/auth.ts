import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../config/jwt';

/**
 * JWT 认证中间件
 * 验证请求头中的 Authorization: Bearer <token>
 * 验证通过后将用户信息挂载到 req.user
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      code: 401,
      data: null,
      message: '未提供认证令牌',
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload: JwtPayload = verifyToken(token);
    req.user = {
      id: BigInt(payload.userId),
      name: payload.name,
      email: null,
      roles: payload.roles,
      department_id: null,
    };
    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      data: null,
      message: '认证令牌无效或已过期',
    });
  }
}
