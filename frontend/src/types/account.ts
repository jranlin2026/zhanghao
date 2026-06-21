import type { PlatformType, RiskLevel, Status, OwnerSubject, PermissionStatus } from '@/utils/constants';

/**
 * 互联网账号 DTO
 * 对应 system_design.md 类图中的 InternetAccountDTO
 */
export interface InternetAccountDTO {
  id: number;
  phone_number_id: number;
  account_code: string;
  platform: PlatformType;
  account_name: string;
  login_account: string;
  bind_phone: string | null;
  bind_email: string | null;
  owner_subject: OwnerSubject;
  purpose: string | null;
  monthly_fee: number;
  expire_at: string | null;
  department_id: number | null;
  owner_user_id: number | null;
  current_user_id: number | null;
  permission_status: PermissionStatus;
  status: Status;
  risk_level: RiskLevel;
  remark: string | null;
  created_at: string;
  updated_at: string;
  /** 部门名称（关联查询填充） */
  department_name?: string;
  /** 负责人姓名（关联查询填充） */
  owner_name?: string;
  /** 当前使用人姓名（关联查询填充） */
  current_user_name?: string;
}

/**
 * 敏感信息 DTO
 * 对应 system_design.md 类图中的 SensitiveInfoDTO
 */
export interface SensitiveInfoDTO {
  id: number;
  account_id: number;
  /** 登录密码（明文 - 仅查看时返回） */
  login_password: string | null;
  /** 实名信息（明文 - 仅查看时返回） */
  real_name_info: string | null;
  /** 密码最近修改时间 */
  password_updated_at: string | null;
  /** 是否设置了密码 */
  has_password: boolean;
  /** 是否设置了实名信息 */
  has_real_name: boolean;
}

/** 创建互联网账号请求 */
export interface CreateAccountRequest {
  phone_number_id: number;
  platform: PlatformType;
  account_name: string;
  login_account: string;
  bind_phone?: string | null;
  bind_email?: string | null;
  owner_subject?: OwnerSubject;
  purpose?: string | null;
  service_provider?: string | null;
  monthly_fee?: number;
  expire_at?: string | null;
  department_id?: number | null;
  owner_user_id?: number | null;
  current_user_id?: number | null;
  permission_status?: PermissionStatus;
  status?: Status;
  risk_level?: RiskLevel;
  remark?: string | null;
}

/** 更新互联网账号请求 */
export type UpdateAccountRequest = Partial<CreateAccountRequest>;

/** 互联网账号查询参数 */
export interface AccountQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  phone_number_id?: number;
  platform?: string;
  status?: string;
  risk_level?: string;
  permission_status?: string;
  department_id?: number;
  owner_user_id?: number;
  current_user_id?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 批量操作请求 */
export interface BatchOperationRequest {
  ids: number[];
  action: 'change_owner' | 'revoke_permission' | 'mark_high_risk' | 'export';
  value?: string | number;
}
