import { z } from 'zod';

/**
 * 查询参数 Zod 校验 Schema
 * 通用分页/排序/搜索/筛选参数
 */

/** 基础分页查询参数 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1).default(1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().min(1).max(100).default(50)),
  sortBy: z
    .string()
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  search: z
    .string()
    .optional(),
});

/** 设备查询参数 */
export const deviceQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  risk_level: z.string().optional(),
  department_id: z.string().optional(),
  owner_user_id: z.string().optional(),
  sim_type: z.enum(['single', 'dual']).optional(),
});

/** 手机号查询参数 */
export const phoneQuerySchema = paginationSchema.extend({
  device_id: z.string().optional(),
  status: z.string().optional(),
  carrier: z.string().optional(),
  slot_type: z.enum(['sim1', 'sim2']).optional(),
  owner_user_id: z.string().optional(),
});

/** 互联网账号查询参数 */
export const accountQuerySchema = paginationSchema.extend({
  phone_number_id: z.string().optional(),
  platform: z.string().optional(),
  status: z.string().optional(),
  risk_level: z.string().optional(),
  permission_status: z.string().optional(),
  department_id: z.string().optional(),
  owner_user_id: z.string().optional(),
  current_user_id: z.string().optional(),
});

/** 操作日志查询参数 */
export const logQuerySchema = paginationSchema.extend({
  operator_id: z.string().optional(),
  action_type: z.string().optional(),
  target_type: z.string().optional(),
  target_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

/** 风险查询参数 */
export const riskQuerySchema = paginationSchema.extend({
  entity_type: z.string().optional(),
  risk_level: z.string().optional(),
  status: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type DeviceQuery = z.infer<typeof deviceQuerySchema>;
export type PhoneQuery = z.infer<typeof phoneQuerySchema>;
export type AccountQuery = z.infer<typeof accountQuerySchema>;
export type LogQuery = z.infer<typeof logQuerySchema>;
export type RiskQuery = z.infer<typeof riskQuerySchema>;
