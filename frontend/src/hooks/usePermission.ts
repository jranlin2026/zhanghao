import { useAuthStore } from '@/stores/authStore';

/**
 * 权限校验 Hook
 * 根据当前用户角色判断是否拥有指定权限
 *
 * 角色层级:
 *   super_admin (超级管理员) — 所有操作放行
 *   boss (老板) — 查看所有，只读
 *   account_admin (账号管理员) — 所有增删改查
 *   dept_manager (部门负责人) — 本部门
 *   employee (普通员工) — 仅与自己相关
 *
 * 用法:
 *   const { canEdit, canViewSensitive } = usePermission();
 *   if (canViewSensitive) { ... }
 */
export function usePermission() {
  const { hasPermission, roles, user } = useAuthStore();

  /** 是否可以编辑（增、删、改） */
  const canEdit = hasPermission(['super_admin', 'account_admin']);

  /** 是否可以查看敏感信息 */
  const canViewSensitive = hasPermission(['super_admin', 'account_admin', 'dept_manager']);

  /** 是否可以执行管理操作（系统设置、用户管理等） */
  const canManage = hasPermission(['super_admin']);

  /** 是否可以查看所有数据（包括其他部门） */
  const canViewAll = hasPermission(['super_admin', 'boss', 'account_admin']);

  /** 是否可以导出数据 */
  const canExport = hasPermission(['super_admin', 'account_admin']);

  /** 是否可以批量操作 */
  const canBatch = hasPermission(['super_admin', 'account_admin']);

  /** 是否为只读角色 */
  const isReadOnly = hasPermission(['boss']) && !hasPermission(['super_admin', 'account_admin']);

  /** 检查是否拥有指定角色 */
  const checkRole = (requiredRoles: string[]): boolean => {
    return hasPermission(requiredRoles);
  };

  return {
    canEdit,
    canViewSensitive,
    canManage,
    canViewAll,
    canExport,
    canBatch,
    isReadOnly,
    roles,
    userId: user?.id,
    checkRole,
    hasPermission,
  };
}
