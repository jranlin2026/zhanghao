import { z } from 'zod';

/**
 * 互联网账号表单 Zod 校验 Schema
 */

/** 创建互联网账号校验 */
export const createAccountSchema = z.object({
  phone_number_id: z
    .number({ required_error: '手机号ID不能为空' }),
  platform: z
    .string()
    .min(1, '平台类型不能为空'),
  account_name: z
    .string()
    .min(1, '账号名称不能为空')
    .max(100, '账号名称不能超过100个字符'),
  login_account: z
    .string()
    .min(1, '登录账号不能为空'),
  bind_phone: z
    .string()
    .nullable()
    .optional(),
  bind_email: z
    .string()
    .email('邮箱格式不正确')
    .nullable()
    .optional()
    .or(z.literal('')),
  owner_subject: z
    .string()
    .optional(),
  purpose: z
    .string()
    .max(200, '用途说明不能超过200个字符')
    .nullable()
    .optional(),
  service_provider: z
    .string()
    .nullable()
    .optional(),
  monthly_fee: z
    .number()
    .min(0, '月费用不能为负数')
    .optional()
    .default(0),
  expire_at: z
    .string()
    .nullable()
    .optional(),
  department_id: z
    .number()
    .nullable()
    .optional(),
  owner_user_id: z
    .number()
    .nullable()
    .optional(),
  current_user_id: z
    .number()
    .nullable()
    .optional(),
  permission_status: z
    .string()
    .optional(),
  status: z
    .string()
    .optional(),
  risk_level: z
    .string()
    .optional(),
  remark: z
    .string()
    .max(500, '备注不能超过500个字符')
    .nullable()
    .optional(),
});

/** 更新互联网账号校验（所有字段可选） */
export const updateAccountSchema = createAccountSchema.partial();

/** 批量操作校验 */
export const batchOperationSchema = z.object({
  ids: z
    .array(z.number())
    .min(1, '至少选择一个账号'),
  action: z
    .enum(['change_owner', 'revoke_permission', 'mark_high_risk', 'export']),
  value: z
    .union([z.string(), z.number()])
    .optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type BatchOperationInput = z.infer<typeof batchOperationSchema>;
