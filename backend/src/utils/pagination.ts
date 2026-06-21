import { Prisma } from '@prisma/client';

/**
 * 分页查询参数
 */
export interface PaginationInput {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页元信息
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 分页查询返回值
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * 解析分页参数
 */
export function parsePagination(params: PaginationInput): {
  skip: number;
  take: number;
  orderBy: Record<string, 'asc' | 'desc'> | undefined;
} {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 50));
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  let orderBy: Record<string, 'asc' | 'desc'> | undefined;
  if (params.sortBy) {
    orderBy = { [params.sortBy]: params.sortOrder || 'asc' };
  } else {
    orderBy = { updated_at: 'desc' };
  }

  return { skip, take, orderBy };
}

/**
 * 构造 Prisma findMany 的分页参数
 * @param params 分页输入参数
 * @param where 可选的 where 条件
 * @returns findMany 参数对象
 */
export function buildFindManyParams<T extends Record<string, unknown>>(
  params: PaginationInput,
  where?: T,
): {
  skip: number;
  take: number;
  orderBy: Record<string, 'asc' | 'desc'>;
  where: T | undefined;
} {
  const { skip, take, orderBy } = parsePagination(params);
  return { skip, take, orderBy: orderBy!, where };
}

/**
 * 包装带分页的查询结果
 */
export function wrapPaginatedResult<T>(data: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  return {
    data,
    pagination: { page, pageSize, total },
  };
}
