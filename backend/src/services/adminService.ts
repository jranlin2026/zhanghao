import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ROLE_CODES } from '../types/enums';
import { buildFindManyParams, wrapPaginatedResult, type PaginationInput, type PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

/**
 * 系统设置服务
 * 用户管理、部门管理、角色管理、字典查询
 */
export const adminService = {
  // ── 用户管理 ──

  /**
   * 用户列表
   */
  async getUsers(params: PaginationInput & { search?: string }): Promise<PaginatedResult<any>> {
    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
      ];
    }

    const { skip, take, orderBy } = buildFindManyParams(params, where);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          department: { select: { id: true, name: true } },
          userRoles: { include: { role: { select: { id: true, code: true, name: true } } } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const mapped = users.map((u) => ({
      id: Number(u.id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      department_id: u.departmentId ? Number(u.departmentId) : null,
      department_name: u.department?.name || null,
      status: u.status,
      role_codes: u.userRoles.map((ur) => ur.role.code),
      role_names: u.userRoles.map((ur) => ur.role.name),
      created_at: u.createdAt,
      updated_at: u.updatedAt,
    }));

    return wrapPaginatedResult(mapped, total, params.page || 1, params.pageSize || 50);
  },

  /**
   * 创建用户
   */
  async createUser(data: { name: string; email?: string; phone?: string; department_id?: number | null; roles?: string[]; password?: string }) {
    const passwordHash = data.password ? await bcrypt.hash(data.password, SALT_ROUNDS) : await bcrypt.hash('123456', SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        departmentId: data.department_id ? BigInt(data.department_id) : null,
        passwordHash,
        userRoles: data.roles && data.roles.length > 0
          ? {
              create: await Promise.all(
                data.roles.map(async (code) => {
                  const role = await prisma.role.findUnique({ where: { code } });
                  return { roleId: role!.id };
                }),
              ),
            }
          : undefined,
      },
      include: { department: { select: { id: true, name: true } }, userRoles: { include: { role: true } } },
    });

    return user;
  },

  /**
   * 更新用户
   */
  async updateUser(id: number, data: { name?: string; email?: string; phone?: string; department_id?: number | null; status?: string; roles?: string[]; password?: string }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.department_id !== undefined) updateData.departmentId = data.department_id ? BigInt(data.department_id) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    if (data.roles !== undefined) {
      // 删除旧角色，添加新角色
      await prisma.userRole.deleteMany({ where: { userId: BigInt(id) } });
      if (data.roles.length > 0) {
        const roles = await prisma.role.findMany({ where: { code: { in: data.roles } } });
        await prisma.userRole.createMany({
          data: roles.map((r) => ({ userId: BigInt(id), roleId: r.id })),
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { department: { select: { id: true, name: true } }, userRoles: { include: { role: true } } },
    });

    return user;
  },

  // ── 部门管理 ──

  /**
   * 部门列表
   */
  async getDepartments() {
    const departments = await prisma.department.findMany({
      include: {
        manager: { select: { id: true, name: true } },
        _count: { select: { users: true, devices: true } },
      },
      orderBy: { name: 'asc' },
    });
    return departments.map((d) => ({
      id: Number(d.id),
      name: d.name,
      manager_user_id: d.managerUserId ? Number(d.managerUserId) : null,
      manager_name: d.manager?.name || null,
      user_count: d._count.users,
      device_count: d._count.devices,
      created_at: d.createdAt,
      updated_at: d.updatedAt,
    }));
  },

  /**
   * 创建部门
   */
  async createDepartment(data: { name: string; manager_user_id?: number }) {
    const dept = await prisma.department.create({
      data: {
        name: data.name,
        managerUserId: data.manager_user_id ? BigInt(data.manager_user_id) : null,
      },
    });
    return { id: Number(dept.id), name: dept.name };
  },

  /**
   * 更新部门
   */
  async updateDepartment(id: number, data: { name?: string; manager_user_id?: number }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.manager_user_id !== undefined) updateData.managerUserId = data.manager_user_id ? BigInt(data.manager_user_id) : null;

    const dept = await prisma.department.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
    return { id: Number(dept.id), name: dept.name };
  },

  // ── 角色管理 ──

  /**
   * 角色列表
   */
  async getRoles() {
    const roles = await prisma.role.findMany({ orderBy: { code: 'asc' } });
    return roles.map((r) => ({ id: Number(r.id), code: r.code, name: r.name }));
  },

  // ── 字典查询 ──

  /**
   * 字典项查询
   */
  async getDict(type: string) {
    switch (type) {
      case 'platform':
        return [
          { value: '微信', label: '微信' },
          { value: '抖音', label: '抖音' },
          { value: '小红书', label: '小红书' },
          { value: '快手', label: '快手' },
          { value: 'TikTok', label: 'TikTok' },
          { value: 'Google', label: 'Google' },
          { value: 'QQ', label: 'QQ' },
          { value: '微博', label: '微博' },
          { value: 'B站', label: 'B站' },
          { value: '淘宝', label: '淘宝' },
          { value: '京东', label: '京东' },
          { value: '拼多多', label: '拼多多' },
          { value: '美团', label: '美团' },
          { value: '其他', label: '其他' },
        ];
      case 'sim_type':
        return [
          { value: 'single', label: '单卡' },
          { value: 'dual', label: '双卡' },
        ];
      case 'status':
        return [
          { value: '启用中', label: '启用中' },
          { value: '闲置', label: '闲置' },
          { value: '已注销', label: '已注销' },
        ];
      case 'risk_level':
        return [
          { value: 'high', label: '高风险' },
          { value: 'medium', label: '中风险' },
          { value: 'low', label: '低风险' },
          { value: 'none', label: '正常' },
        ];
      case 'action_type':
        return Object.entries({
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
          IMPORT_DATA: '导入数据',
          EXPORT_DATA: '导出数据',
        }).map(([value, label]) => ({ value, label }));
      default:
        return [];
    }
  },
};
