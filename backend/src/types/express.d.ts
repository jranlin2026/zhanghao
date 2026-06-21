import { User } from '@prisma/client';

/**
 * Express Request 类型扩展
 * 在 JWT 认证中间件中将用户信息附加到 req
 */
declare global {
  namespace Express {
    interface Request {
      /** 当前认证用户 */
      user?: {
        id: bigint;
        name: string;
        email: string | null;
        roles: string[];
        department_id: bigint | null;
      };
    }
  }
}

export {};
