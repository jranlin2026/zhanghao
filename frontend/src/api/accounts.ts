import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  InternetAccountDTO,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountQueryParams,
  BatchOperationRequest,
} from '@/types';

/**
 * 获取互联网账号列表
 * GET /api/internet-accounts
 */
export async function getAccounts(params?: AccountQueryParams): Promise<PaginatedResponse<InternetAccountDTO>> {
  const res = await apiClient.get<PaginatedResponse<InternetAccountDTO>>('/internet-accounts', { params });
  return res.data;
}

/**
 * 获取账号详情
 * GET /api/internet-accounts/:id
 */
export async function getAccountById(id: number): Promise<ApiResponse<InternetAccountDTO>> {
  const res = await apiClient.get<ApiResponse<InternetAccountDTO>>(`/internet-accounts/${id}`);
  return res.data;
}

/**
 * 新增互联网账号
 * POST /api/internet-accounts
 */
export async function createAccount(data: CreateAccountRequest): Promise<ApiResponse<InternetAccountDTO>> {
  const res = await apiClient.post<ApiResponse<InternetAccountDTO>>('/internet-accounts', data);
  return res.data;
}

/**
 * 编辑互联网账号
 * PUT /api/internet-accounts/:id
 */
export async function updateAccount(id: number, data: UpdateAccountRequest): Promise<ApiResponse<InternetAccountDTO>> {
  const res = await apiClient.put<ApiResponse<InternetAccountDTO>>(`/internet-accounts/${id}`, data);
  return res.data;
}

/**
 * 软删除互联网账号
 * DELETE /api/internet-accounts/:id
 */
export async function deleteAccount(id: number): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>(`/internet-accounts/${id}`);
  return res.data;
}

/**
 * 批量操作
 * POST /api/internet-accounts/batch
 */
export async function batchOperation(data: BatchOperationRequest): Promise<ApiResponse<null>> {
  const res = await apiClient.post<ApiResponse<null>>('/internet-accounts/batch', data);
  return res.data;
}
