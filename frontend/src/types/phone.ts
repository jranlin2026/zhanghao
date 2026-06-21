import type { InternetAccountDTO } from './account';
import type { SlotType, Carrier, Status } from '@/utils/constants';

/**
 * 手机号 DTO
 * 对应 system_design.md 类图中的 PhoneNumberDTO
 */
export interface PhoneNumberDTO {
  id: number;
  device_id: number;
  slot_type: SlotType;
  phone_number: string;
  carrier: Carrier;
  is_primary: boolean;
  monthly_fee: number;
  plan_type: string | null;
  owner_user_id: number | null;
  status: Status;
  remark: string | null;
  created_at: string;
  updated_at: string;
  /** 所属设备名称（关联查询填充） */
  device_name?: string;
  /** 负责人姓名（关联查询填充） */
  owner_name?: string;
  /** 关联的互联网账号列表 */
  internet_accounts?: InternetAccountDTO[];
}

/** 创建手机号请求 */
export interface CreatePhoneNumberRequest {
  device_id: number;
  slot_type: SlotType;
  phone_number: string;
  carrier: Carrier;
  is_primary?: boolean;
  monthly_fee?: number;
  plan_type?: string | null;
  owner_user_id?: number | null;
  status?: Status;
  remark?: string | null;
}

/** 更新手机号请求 */
export type UpdatePhoneNumberRequest = Partial<CreatePhoneNumberRequest>;

/** 手机号查询参数 */
export interface PhoneQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  device_id?: number;
  status?: string;
  carrier?: string;
  slot_type?: string;
  owner_user_id?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
