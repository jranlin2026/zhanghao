import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ code: 409, data: null, message: '数据已存在，请检查唯一字段' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ code: 400, data: null, message: '绑定的数据不存在，请检查关联关系' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ code: 404, data: null, message: '请求的记录不存在' });
      return;
    }
  }

  const statusCode = Number((err as { statusCode?: number }).statusCode) || 500;
  console.error('[Error]', err.message);

  res.status(statusCode).json({
    code: statusCode,
    data: null,
    message: err.message || '服务器内部错误',
  });
}
