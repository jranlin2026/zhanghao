import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  PhoneNumberDTO,
  CreatePhoneNumberRequest,
  UpdatePhoneNumberRequest,
  PhoneQueryParams,
} from '@/types';

/**
 * 获取手机号列表
 * GET /api/phone-numbers
 */
export async function getPhones(params?: PhoneQueryParams): Promise<PaginatedResponse<PhoneNumberDTO>> {
  const res = await apiClient.get<PaginatedResponse<PhoneNumberDTO>>('/phone-numbers', { params });
  return res.data;
}

/**
 * 获取手机号详情（含关联账号）
 * GET /api/phone-numbers/:id
 */
export async function getPhoneById(id: number): Promise<ApiResponse<PhoneNumberDTO>> {
  const res = await apiClient.get<ApiResponse<PhoneNumberDTO>>(`/phone-numbers/${id}`);
  return res.data;
}

/**
 * 新增手机号
 * POST /api/phone-numbers
 */
export async function createPhone(data: CreatePhoneNumberRequest): Promise<ApiResponse<PhoneNumberDTO>> {
  const res = await apiClient.post<ApiResponse<PhoneNumberDTO>>('/phone-numbers', data);
  return res.data;
}

/**
 * 编辑手机号
 * PUT /api/phone-numbers/:id
 */
export async function updatePhone(id: number, data: UpdatePhoneNumberRequest): Promise<ApiResponse<PhoneNumberDTO>> {
  const res = await apiClient.put<ApiResponse<PhoneNumberDTO>>(`/phone-numbers/${id}`, data);
  return res.data;
}

/**
 * 软删除手机号
 * DELETE /api/phone-numbers/:id
 */
export async function deletePhone(id: number): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>(`/phone-numbers/${id}`);
  return res.data;
}

/**
 * 根据设备 ID 获取手机号列表
 * GET /api/phone-numbers?device_id=:deviceId
 */
export async function getPhonesByDeviceId(deviceId: number): Promise<PaginatedResponse<PhoneNumberDTO>> {
  return getPhones({ device_id: deviceId, pageSize: 100 });
}
