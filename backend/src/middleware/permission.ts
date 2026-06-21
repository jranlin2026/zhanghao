import { Request, Response, NextFunction } from 'express';

/**
 * RBAC 权限校验中间件工厂
 * @param allowedRoles 允许访问的角色编码数组
 * @returns Express 中间件
 *
 * 用法: router.get('/path', requireRole(['super_admin', 'account_admin']), handler)
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 先确保已通过认证
    if (!req.user) {
      res.status(401).json({
        code: 401,
        data: null,
        message: '未认证，请先登录',
      });
      return;
    }

    // super_admin 拥有所有权限
    if (req.user.roles.includes('super_admin')) {
      next();
      return;
    }

    // 检查是否拥有指定角色
    const hasRole = allowedRoles.some((role) => req.user!.roles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        code: 403,
        data: null,
        message: '权限不足，无法执行此操作',
      });
      return;
    }

    next();
  };
}
