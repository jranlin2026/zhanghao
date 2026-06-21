import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

/**
 * 全局错误处理中间件
 * 统一 API 错误响应格式：{ code, data: null, message }
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[Error]', err.message, err.stack);

  // Prisma 错误处理
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // 唯一约束冲突
        res.status(409).json({
          code: 409,
          data: null,
          message: '数据已存在，请检查唯一字段',
        });
        return;
      case 'P2025':
        // 记录未找到
        res.status(404).json({
          code: 404,
          data: null,
          message: '请求的记录不存在',
        });
        return;
      default:
        res.status(500).json({
          code: 500,
          data: null,
          message: '数据操作异常',
        });
        return;
    }
  }

  // Prisma 验证错误
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      code: 400,
      data: null,
      message: '请求数据格式错误',
    });
    return;
  }

  // Zod 验证错误（由各路由自行处理，这里作为兜底）
  if (err.name === 'ZodError') {
    res.status(400).json({
      code: 400,
      data: null,
      message: '请求参数校验失败',
      errors: (err as any).errors,
    });
    return;
  }

  // 通用错误
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    data: null,
    message: err.message || '服务器内部错误',
  });
}
