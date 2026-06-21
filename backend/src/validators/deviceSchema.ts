import { z } from 'zod';

/**
 * 设备表单 Zod 校验 Schema
 */

/** 创建设备校验 */
export const createDeviceSchema = z.object({
  device_name: z
    .string()
    .min(1, '设备名称不能为空')
    .max(100, '设备名称不能超过100个字符'),
  brand_model: z
    .string()
    .min(1, '品牌型号不能为空'),
  imei: z
    .string()
    .min(15, 'IMEI码长度不正确（15-17位）')
    .max(17, 'IMEI码长度不正确（15-17位）')
    .regex(/^[A-Za-z0-9]+$/, 'IMEI码只能包含字母和数字'),
  sim_type: z
    .enum(['single', 'dual'], { errorMap: () => ({ message: 'SIM类型必须为 single 或 dual' }) }),
  owner_subject: z
    .string()
    .min(1, '所属主体不能为空'),
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

/** 更新设备校验（所有字段可选） */
export const updateDeviceSchema = createDeviceSchema.partial();

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
