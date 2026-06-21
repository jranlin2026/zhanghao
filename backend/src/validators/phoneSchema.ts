import { z } from 'zod';

/**
 * 手机号表单 Zod 校验 Schema
 */

/** 创建手机号校验 */
export const createPhoneSchema = z.object({
  device_id: z
    .number({ required_error: '设备ID不能为空' }),
  slot_type: z
    .enum(['sim1', 'sim2'], { errorMap: () => ({ message: '卡槽类型必须为 sim1 或 sim2' }) }),
  phone_number: z
    .string()
    .regex(/^\d{11}$/, '手机号必须为11位数字'),
  carrier: z
    .string()
    .min(1, '运营商不能为空'),
  is_primary: z
    .boolean()
    .optional()
    .default(false),
  monthly_fee: z
    .number()
    .min(0, '月费用不能为负数')
    .optional()
    .default(0),
  plan_type: z
    .string()
    .nullable()
    .optional(),
  owner_user_id: z
    .number()
    .nullable()
    .optional(),
  status: z
    .string()
    .optional(),
  remark: z
    .string()
    .max(500, '备注不能超过500个字符')
    .nullable()
    .optional(),
});

/** 更新手机号校验（所有字段可选） */
export const updatePhoneSchema = createPhoneSchema.partial();

export type CreatePhoneInput = z.infer<typeof createPhoneSchema>;
export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>;
