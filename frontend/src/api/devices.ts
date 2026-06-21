import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  DeviceDTO,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  DeviceQueryParams,
  DeviceStats,
} from '@/types';

/**
 * 获取设备列表（分页/筛选/搜索）
 * GET /api/devices
 */
export async function getDevices(params?: DeviceQueryParams): Promise<PaginatedResponse<DeviceDTO>> {
  const res = await apiClient.get<PaginatedResponse<DeviceDTO>>('/devices', { params });
  return res.data;
}

/**
 * 获取设备详情（含关联手机号）
 * GET /api/devices/:id
 */
export async function getDeviceById(id: number): Promise<ApiResponse<DeviceDTO>> {
  const res = await apiClient.get<ApiResponse<DeviceDTO>>(`/devices/${id}`);
  return res.data;
}

/**
 * 新增设备
 * POST /api/devices
 */
export async function createDevice(data: CreateDeviceRequest): Promise<ApiResponse<DeviceDTO>> {
  const res = await apiClient.post<ApiResponse<DeviceDTO>>('/devices', data);
  return res.data;
}

/**
 * 编辑设备
 * PUT /api/devices/:id
 */
export async function updateDevice(id: number, data: UpdateDeviceRequest): Promise<ApiResponse<DeviceDTO>> {
  const res = await apiClient.put<ApiResponse<DeviceDTO>>(`/devices/${id}`, data);
  return res.data;
}

/**
 * 软删除设备
 * DELETE /api/devices/:id
 */
export async function deleteDevice(id: number): Promise<ApiResponse<null>> {
  const res = await apiClient.delete<ApiResponse<null>>(`/devices/${id}`);
  return res.data;
}

/**
 * 获取设备 KPI 统计
 * GET /api/devices/stats
 */
export async function getDeviceStats(): Promise<ApiResponse<DeviceStats>> {
  const res = await apiClient.get<ApiResponse<DeviceStats>>('/devices/stats');
  return res.data;
}
