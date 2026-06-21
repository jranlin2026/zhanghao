import apiClient from './client';
import type { ApiResponse, PaginatedResponse, UserListItem, CreateUserRequest, UpdateUserRequest, RoleInfo } from '@/types';
import type { DepartmentOption } from '@/utils/constants';

/**
 * 获取用户列表
 * GET /api/admin/users
 */
export async function getUsers(params?: { page?: number; pageSize?: number; search?: string }): Promise<PaginatedResponse<UserListItem>> {
  const res = await apiClient.get<PaginatedResponse<UserListItem>>('/admin/users', { params });
  return res.data;
}

/**
 * 新增用户
 * POST /api/admin/users
 */
export async function createUser(data: CreateUserRequest): Promise<ApiResponse<UserListItem>> {
  const res = await apiClient.post<ApiResponse<UserListItem>>('/admin/users', data);
  return res.data;
}

/**
 * 编辑用户
 * PUT /api/admin/users/:id
 */
export async function updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<UserListItem>> {
  const res = await apiClient.put<ApiResponse<UserListItem>>(`/admin/users/${id}`, data);
  return res.data;
}

/**
 * 获取部门列表
 * GET /api/admin/departments
 */
export async function getDepartments(): Promise<ApiResponse<DepartmentOption[]>> {
  const res = await apiClient.get<ApiResponse<DepartmentOption[]>>('/admin/departments');
  return res.data;
}

/**
 * 新增部门
 * POST /api/admin/departments
 */
export async function createDepartment(data: { name: string; manager_user_id?: number }): Promise<ApiResponse<DepartmentOption>> {
  const res = await apiClient.post<ApiResponse<DepartmentOption>>('/admin/departments', data);
  return res.data;
}

/**
 * 编辑部门
 * PUT /api/admin/departments/:id
 */
export async function updateDepartment(id: number, data: { name?: string; manager_user_id?: number }): Promise<ApiResponse<DepartmentOption>> {
  const res = await apiClient.put<ApiResponse<DepartmentOption>>(`/admin/departments/${id}`, data);
  return res.data;
}

/**
 * 获取角色列表
 * GET /api/admin/roles
 */
export async function getRoles(): Promise<ApiResponse<RoleInfo[]>> {
  const res = await apiClient.get<ApiResponse<RoleInfo[]>>('/admin/roles');
  return res.data;
}

/**
 * 获取字典项
 * GET /api/admin/dict/:type
 */
export async function getDict(type: string): Promise<ApiResponse<{ value: string; label: string }[]>> {
  const res = await apiClient.get<ApiResponse<{ value: string; label: string }[]>>(`/admin/dict/${type}`);
  return res.data;
}
