/**
 * 操作日志 DTO
 * 对应 system_design.md 类图中的 OperationLogDTO
 */
export interface OperationLogDTO {
  id: number;
  operator_id: number;
  /** 操作人姓名（关联查询填充） */
  operator_name?: string;
  action_type: string;
  target_type: string;
  target_id: number | null;
  target_name: string | null;
  /** 修改前数据（JSON 字符串） */
  before_data: string | null;
  /** 修改后数据（JSON 字符串） */
  after_data: string | null;
  ip_address: string | null;
  device_info: string | null;
  remark: string | null;
  created_at: string;
}

/** 操作日志查询参数 */
export interface LogQueryParams {
  page?: number;
  pageSize?: number;
  operator_id?: number;
  action_type?: string;
  target_type?: string;
  target_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
