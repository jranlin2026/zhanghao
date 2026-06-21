import apiClient from './client';
import type { ApiResponse, SensitiveInfoDTO } from '@/types';

/**
 * 查看敏感信息（写操作日志）
 * GET /api/internet-accounts/:id/sensitive
 */
export async function viewSensitive(accountId: number): Promise<ApiResponse<SensitiveInfoDTO>> {
  const res = await apiClient.get<ApiResponse<SensitiveInfoDTO>>(`/internet-accounts/${accountId}/sensitive`);
  return res.data;
}

/**
 * 复制敏感信息（写操作日志）
 * POST /api/internet-accounts/:id/sensitive/copy
 */
export async function copySensitiveField(
  accountId: number,
  field: 'login_password' | 'real_name_info',
): Promise<ApiResponse<string>> {
  const res = await apiClient.post<ApiResponse<string>>(`/internet-accounts/${accountId}/sensitive/copy`, { field });
  return res.data;
}

/**
 * 修改敏感信息
 * PUT /api/internet-accounts/:id/sensitive
 */
export async function updateSensitive(
  accountId: number,
  data: { login_password?: string; real_name_info?: string; backup_info?: string },
): Promise<ApiResponse<SensitiveInfoDTO>> {
  const res = await apiClient.put<ApiResponse<SensitiveInfoDTO>>(`/internet-accounts/${accountId}/sensitive`, data);
  return res.data;
}
