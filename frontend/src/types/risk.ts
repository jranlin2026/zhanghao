import type { RiskLevel, RiskCode } from '@/utils/constants';

/**
 * 风险 DTO
 * 对应 system_design.md 类图中的 RiskDTO
 */
export interface RiskDTO {
  id: number;
  entity_type: string;
  entity_id: number;
  /** 关联实体的名称（关联查询填充） */
  entity_name?: string;
  risk_code: RiskCode;
  risk_title: string;
  risk_level: RiskLevel;
  risk_reason: string;
  suggestion: string | null;
  status: 'open' | 'ignored' | 'resolved';
  detected_at: string;
  resolved_at: string | null;
}

/** 风险查询参数 */
export interface RiskQueryParams {
  page?: number;
  pageSize?: number;
  entity_type?: string;
  risk_level?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 更新风险状态请求 */
export interface UpdateRiskStatusRequest {
  status: 'open' | 'ignored' | 'resolved';
}
