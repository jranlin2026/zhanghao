import { Response } from 'express';
import type { PaginationMeta } from './pagination';

/**
 * 统一 API 响应格式工具
 *
 * 标准格式: { code: number, data: T, message: string, pagination?: PaginationMeta }
 */

/** 成功响应（含可选分页信息） */
export function success<T>(res: Response, data: T, message = 'success', pagination?: PaginationMeta): void {
  const body: Record<string, unknown> = {
    code: 200,
    data,
    message,
  };
  if (pagination) {
    body.pagination = pagination;
  }
  res.status(200).json(body);
}

/** 失败响应 */
export function fail(res: Response, message: string, code = 400, data: unknown = null): void {
  res.status(code).json({
    code,
    data,
    message,
  });
}

/** 资源未找到 */
export function notFound(res: Response, message = '资源未找到'): void {
  fail(res, message, 404);
}

/** 权限不足 */
export function forbidden(res: Response, message = '权限不足'): void {
  fail(res, message, 403);
}

/** 未认证 */
export function unauthorized(res: Response, message = '未认证'): void {
  fail(res, message, 401);
}

/** 服务器错误 */
export function serverError(res: Response, message = '服务器内部错误'): void {
  fail(res, message, 500);
}
