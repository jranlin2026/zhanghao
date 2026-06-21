/**
 * API 通用响应类型
 */

/** 通用 API 响应 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** 分页元信息 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

/** 分页请求参数 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
