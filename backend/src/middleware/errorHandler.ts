import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = Number((err as { statusCode?: number }).statusCode) || 500;
  console.error('[Error]', err.message);

  res.status(statusCode).json({
    code: statusCode,
    data: null,
    message: err.message || '服务器内部错误',
  });
}
