import type { PhoneNumberDTO } from './phone';
import type { SimType, RiskLevel, Status, OwnerSubject } from '@/utils/constants';

/**
 * 设备 DTO
 * 对应 system_design.md 类图中的 DeviceDTO
 */
export interface DeviceDTO {
  id: number;
  device_code: string;
  device_name: string;
  brand_model: string;
  imei: string;
  sim_type: SimType;
  owner_subject: OwnerSubject;
  department_id: number | null;
  owner_user_id: number | null;
  current_user_id: number | null;
  status: Status;
  risk_level: RiskLevel;
  remark: string | null;
  created_at: string;
  updated_at: string;
  /** 关联的手机号列表 */
  phone_numbers?: PhoneNumberDTO[];
  /** 部门名称（关联查询填充） */
  department_name?: string;
  /** 负责人姓名（关联查询填充） */
  owner_name?: string;
  /** 当前使用人姓名（关联查询填充） */
  current_user_name?: string;
}

/** 创建设备请求 */
export interface CreateDeviceRequest {
  device_name: string;
  brand_model: string;
  imei: string;
  sim_type: SimType;
  owner_subject: OwnerSubject;
  department_id: number | null;
  owner_user_id: number | null;
  current_user_id?: number | null;
  status?: Status;
  remark?: string | null;
}

/** 更新设备请求 */
export type UpdateDeviceRequest = Partial<CreateDeviceRequest>;

/** 设备查询参数 */
export interface DeviceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  risk_level?: string;
  department_id?: number;
  owner_user_id?: number;
  sim_type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 设备 KPI 统计 */
export interface DeviceStats {
  total: number;
  active: number;
  idle: number;
  highRisk: number;
  noOwner: number;
}
