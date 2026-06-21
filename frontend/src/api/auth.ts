import apiClient from './client';
import type { ApiResponse, LoginRequest, LoginResponse, UserDTO } from '@/types';

/**
 * 登录
 * POST /api/auth/login
 */
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  return res.data;
}

/**
 * 获取当前用户信息
 * GET /api/auth/profile
 */
export async function getProfile(): Promise<ApiResponse<UserDTO>> {
  const res = await apiClient.get<ApiResponse<UserDTO>>('/auth/profile');
  return res.data;
}

/**
 * 退出登录
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
