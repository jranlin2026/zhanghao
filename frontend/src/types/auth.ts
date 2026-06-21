/**
 * 认证/用户/角色相关类型
 */

/** 用户 DTO */
export interface UserDTO {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  department_id: number | null;
  department_name?: string;
  status: string;
  /** 用户拥有的角色编码列表 */
  roles: string[];
}

/** 登录请求 */
export interface LoginRequest {
  name: string;
  password: string;
}

/** 登录响应 */
export interface LoginResponse {
  token: string;
  user: UserDTO;
}

/** 用户列表项（系统设置用） */
export interface UserListItem {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  department_id: number | null;
  department_name?: string;
  status: string;
  role_names?: string[];
  created_at: string;
  updated_at: string;
}

/** 创建用户请求 */
export interface CreateUserRequest {
  name: string;
  email?: string;
  phone?: string;
  department_id?: number | null;
  roles?: string[];
  password?: string;
}

/** 更新用户请求 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  department_id?: number | null;
  status?: string;
  roles?: string[];
  password?: string;
}

/** 角色信息 */
export interface RoleInfo {
  id: number;
  code: string;
  name: string;
}
