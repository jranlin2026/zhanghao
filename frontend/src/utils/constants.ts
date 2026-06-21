/**
 * 枚举常量与字典数据
 * 所有枚举字典：平台类型、SIM类型、卡槽类型、实体类型、
 * 状态枚举、风险等级、权限状态、操作类型、部门预定义数据
 */

/* ── 平台类型枚举 ── */
export const PLATFORM_TYPES = [
  '微信',
  '抖音',
  '小红书',
  '快手',
  'TikTok',
  'Google',
  'QQ',
  '微博',
  'B站',
  '淘宝',
  '京东',
  '拼多多',
  '美团',
  '其他',
] as const;

export type PlatformType = (typeof PLATFORM_TYPES)[number];

/* ── SIM 类型枚举 ── */
export const SIM_TYPES = ['single', 'dual'] as const;
export type SimType = (typeof SIM_TYPES)[number];

export const SIM_TYPE_LABELS: Record<SimType, string> = {
  single: '单卡',
  dual: '双卡',
};

/* ── 卡槽类型枚举 ── */
export const SLOT_TYPES = ['sim1', 'sim2'] as const;
export type SlotType = (typeof SLOT_TYPES)[number];

export const SLOT_TYPE_LABELS: Record<SlotType, string> = {
  sim1: 'SIM卡槽1',
  sim2: 'SIM卡槽2',
};

/* ── 实体类型枚举 ── */
export const ENTITY_TYPES = ['device', 'phone', 'account'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  device: '设备',
  phone: '手机号',
  account: '互联网账号',
};

/* ── 状态枚举 ── */
export const STATUSES = ['启用中', '闲置', '已注销'] as const;
export type Status = (typeof STATUSES)[number];

/** 设备特有状态 */
export const DEVICE_STATUSES: Status[] = ['启用中', '闲置', '已注销'];
/** 手机号状态 */
export const PHONE_STATUSES: Status[] = ['启用中', '闲置', '已注销'];
/** 互联网账号状态 */
export const ACCOUNT_STATUSES: Status[] = ['启用中', '闲置', '已注销'];

export const STATUS_COLORS: Record<string, string> = {
  '启用中': 'var(--color-success)',
  '闲置': 'var(--color-idle)',
  '已注销': 'var(--color-gray-400)',
};

/* ── 风险等级枚举 ── */
export const RISK_LEVELS = ['high', 'medium', 'low', 'none'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
  none: '正常',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  high: 'var(--color-danger)',
  medium: 'var(--color-warning)',
  low: 'var(--color-info)',
  none: 'var(--color-success)',
};

export const RISK_LEVEL_BG_COLORS: Record<RiskLevel, string> = {
  high: 'var(--color-danger-bg)',
  medium: 'var(--color-warning-bg)',
  low: 'var(--color-info-bg)',
  none: 'var(--color-success-bg)',
};

/* ── 权限状态枚举 ── */
export const PERMISSION_STATUSES = ['已授权', '待授权', '已过期'] as const;
export type PermissionStatus = (typeof PERMISSION_STATUSES)[number];

export const PERMISSION_STATUS_COLORS: Record<PermissionStatus, string> = {
  '已授权': 'var(--color-success)',
  '待授权': 'var(--color-warning)',
  '已过期': 'var(--color-danger)',
};

/* ── 所属主体枚举 ── */
export const OWNER_SUBJECTS = ['公司', '法人', '员工个人', '客户', '代理', '其他'] as const;
export type OwnerSubject = (typeof OWNER_SUBJECTS)[number];

/* ── 运营商枚举 ── */
export const CARRIERS = ['中国移动', '中国联通', '中国电信', '虚拟运营商'] as const;
export type Carrier = (typeof CARRIERS)[number];

/* ── 操作类型字典 ── */
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

export const ACTION_TYPE_OPTIONS = Object.entries(ACTION_TYPES).map(([value, label]) => ({
  value,
  label,
}));

/* ── 风险编码 ── */
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

/* ── 目标类型（操作日志用） ── */
export const TARGET_TYPES = {
  devices: '设备',
  phone_numbers: '手机号',
  internet_accounts: '互联网账号',
} as const;

export type TargetType = keyof typeof TARGET_TYPES;

/* ── 角色编码 ── */
export const ROLE_CODES = ['super_admin', 'boss', 'account_admin', 'dept_manager', 'employee'] as const;
export type RoleCode = (typeof ROLE_CODES)[number];

export const ROLE_LABELS: Record<RoleCode, string> = {
  super_admin: '超级管理员',
  boss: '老板',
  account_admin: '账号管理员',
  dept_manager: '部门负责人',
  employee: '普通员工',
};

/* ── 部门预定义数据（示例） ── */
export interface DepartmentOption {
  id: number;
  name: string;
}

export const PREDEFINED_DEPARTMENTS: DepartmentOption[] = [
  { id: 1, name: '技术部' },
  { id: 2, name: '运营部' },
  { id: 3, name: '市场部' },
  { id: 4, name: '财务部' },
  { id: 5, name: '人事部' },
  { id: 6, name: '管理层' },
];

/* ── 分页默认值 ── */
export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [20, 50, 100];
