import apiClient from './client';
import type { PaginatedResponse, OperationLogDTO, LogQueryParams } from '@/types';

/**
 * 获取操作日志列表（分页/筛选）
 * GET /api/operation-logs
 */
export async function getLogs(params?: LogQueryParams): Promise<PaginatedResponse<OperationLogDTO>> {
  const res = await apiClient.get<PaginatedResponse<OperationLogDTO>>('/operation-logs', { params });
  return res.data;
}
