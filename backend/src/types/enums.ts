/**
 * 后端枚举定义
 * 与前端 constants.ts 保持一致
 */

/** 平台类型 */
export const PLATFORM_TYPES = [
  '微信', '抖音', '小红书', '快手', 'TikTok',
  'Google', 'QQ', '微博', 'B站', '淘宝',
  '京东', '拼多多', '美团', '其他',
] as const;
export type PlatformType = (typeof PLATFORM_TYPES)[number];

/** SIM 类型 */
export const SIM_TYPES = ['single', 'dual'] as const;
export type SimType = (typeof SIM_TYPES)[number];

/** 卡槽类型 */
export const SLOT_TYPES = ['sim1', 'sim2'] as const;
export type SlotType = (typeof SLOT_TYPES)[number];

/** 实体类型 */
export const ENTITY_TYPES = ['device', 'phone', 'account'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

/** 状态 */
export const STATUSES = ['启用中', '闲置', '已注销'] as const;
export type Status = (typeof STATUSES)[number];

/** 风险等级 */
export const RISK_LEVELS = ['high', 'medium', 'low', 'none'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

/** 权限状态 */
export const PERMISSION_STATUSES = ['已授权', '待授权', '已过期'] as const;
export type PermissionStatus = (typeof PERMISSION_STATUSES)[number];

/** 所属主体 */
export const OWNER_SUBJECTS = ['公司', '法人', '员工个人', '客户', '代理', '其他'] as const;
export type OwnerSubject = (typeof OWNER_SUBJECTS)[number];

/** 运营商 */
export const CARRIERS = ['中国移动', '中国联通', '中国电信', '虚拟运营商'] as const;
export type Carrier = (typeof CARRIERS)[number];

/** 操作类型 */
export const ACTION_TYPES = {
  CREATE_DEVICE: '新增设备',
  UPDATE_DEVICE: '编辑设备',
  DELETE_DEVICE: '删除设备',
  CREATE_PHONE: '新增手机号',
  UPDATE_PHONE: '编辑手机号',
  DELETE_PHONE: '删除手机号',
  CREATE_ACCOUNT: '新增账号',
  UPDATE_ACCOUNT: '编辑账号',
  DELETE_ACCOUNT: '删除账号',
  VIEW_SENSITIVE: '查看敏感信息',
  COPY_SENSITIVE: '复制敏感信息',
  CHANGE_OWNER: '修改负责人',
  CHANGE_PERMISSION: '修改权限状态',
  IMPORT_DATA: '导入数据',
  EXPORT_DATA: '导出数据',
  BATCH_OPERATION: '批量操作',
} as const;
export type ActionType = keyof typeof ACTION_TYPES;

/** 角色编码 */
export const ROLE_CODES = ['super_admin', 'boss', 'account_admin', 'dept_manager', 'employee'] as const;
export type RoleCode = (typeof ROLE_CODES)[number];

/** 风险编码 */
export const RISK_CODES = {
  DEVICE_NO_OWNER: 'DEVICE_NO_OWNER',
  DEVICE_ABNORMAL: 'DEVICE_ABNORMAL',
  DEVICE_USING_NO_USER: 'DEVICE_USING_NO_USER',
  DEVICE_NO_PHONE: 'DEVICE_NO_PHONE',
  PHONE_NO_OWNER: 'PHONE_NO_OWNER',
  PHONE_HIGH_FEE: 'PHONE_HIGH_FEE',
  PHONE_NO_ACCOUNT: 'PHONE_NO_ACCOUNT',
  ACC_NO_OWNER: 'ACC_NO_OWNER',
  ACC_NO_REAL_NAME: 'ACC_NO_REAL_NAME',
  ACC_NO_BIND_PHONE: 'ACC_NO_BIND_PHONE',
  ACC_ABNORMAL: 'ACC_ABNORMAL',
  ACC_USING_NO_USER: 'ACC_USING_NO_USER',
  ACC_RESIGNED_PENDING: 'ACC_RESIGNED_PENDING',
  ACC_HIGH_RISK_MARKED: 'ACC_HIGH_RISK_MARKED',
} as const;
export type RiskCode = (typeof RISK_CODES)[keyof typeof RISK_CODES];

/** 风险状态 */
export const RISK_STATUSES = ['open', 'ignored', 'resolved'] as const;
export type RiskStatus = (typeof RISK_STATUSES)[number];
