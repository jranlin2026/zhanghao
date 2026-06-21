import apiClient from './client';
import type { ApiResponse, PaginatedResponse, RiskDTO, RiskQueryParams, UpdateRiskStatusRequest } from '@/types';

/**
 * 获取风险列表
 * GET /api/risks
 */
export async function getRisks(params?: RiskQueryParams): Promise<PaginatedResponse<RiskDTO>> {
  const res = await apiClient.get<PaginatedResponse<RiskDTO>>('/risks', { params });
  return res.data;
}

/**
 * 更新风险状态
 * PUT /api/risks/:id
 */
export async function updateRiskStatus(id: number, data: UpdateRiskStatusRequest): Promise<ApiResponse<RiskDTO>> {
  const res = await apiClient.put<ApiResponse<RiskDTO>>(`/risks/${id}`, data);
  return res.data;
}

/**
 * 触发全量风险扫描
 * POST /api/risks/scan
 */
export async function triggerFullScan(): Promise<ApiResponse<{ scanned: number }>> {
  const res = await apiClient.post<ApiResponse<{ scanned: number }>>('/risks/scan');
  return res.data;
}
