import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { canWrite, requireWritable } from './access';
import { validateDepartmentPayload, validateUserPayload } from './adminValidation';

type RequestUser = Express.Request['user'];

function toAccessUser(user: RequestUser) {
  return user ? { id: user.id, roles: user.roles, departmentId: user.departmentId } : undefined;
}

function publicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    department_id: user.department_id,
    department_name: user.department?.name ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function publicDepartment(department: any) {
  return {
    id: department.id,
    name: department.name,
    manager_user_id: department.manager_user_id,
    user_count: department._count?.users ?? 0,
    created_at: department.created_at,
    updated_at: department.updated_at,
  };
}

async function writeLog(user: RequestUser, action: string, targetType: string, targetId: number | null, before?: unknown, after?: unknown) {
  await prisma.operationLog.create({
    data: {
      operator_id: user?.id ?? null,
      action_type: action,
      target_type: targetType,
      target_id: targetId,
      before_data: before === undefined ? undefined : JSON.parse(JSON.stringify(before)),
      after_data: after === undefined ? undefined : JSON.parse(JSON.stringify(after)),
    },
  });
}

export const adminService = {
  async listUsers(user: RequestUser) {
    if (!canWrite(toAccessUser(user))) {
      return [];
    }
    const rows = await prisma.user.findMany({ include: { department: true }, orderBy: { id: 'asc' } });
    return rows.map(publicUser);
  },

  async createUser(user: RequestUser, data: any) {
    requireWritable(toAccessUser(user));
    validateUserPayload(data);
    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        password_hash: await bcrypt.hash(data.password || '123456', 10),
        role: data.role || 'employee',
        status: data.status || 'active',
        department_id: data.department_id ? Number(data.department_id) : null,
      },
      include: { department: true },
    });
    const result = publicUser(created);
    await writeLog(user, 'create', 'user', created.id, undefined, result);
    return result;
  },

  async updateUser(user: RequestUser, id: number, data: any) {
    requireWritable(toAccessUser(user));
    validateUserPayload(data, { partial: true });
    const before = await prisma.user.findUnique({ where: { id }, include: { department: true } });
    if (!before) {
      const error = new Error('用户不存在') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email === undefined ? undefined : data.email || null,
        phone: data.phone === undefined ? undefined : data.phone || null,
        role: data.role,
        status: data.status,
        department_id: data.department_id === undefined ? undefined : Number(data.department_id) || null,
        ...(data.password ? { password_hash: await bcrypt.hash(data.password, 10) } : {}),
      },
      include: { department: true },
    });
    const result = publicUser(updated);
    await writeLog(user, 'update', 'user', id, publicUser(before), result);
    return result;
  },

  async listDepartments() {
    const rows = await prisma.department.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { id: 'asc' },
    });
    return rows.map(publicDepartment);
  },

  async createDepartment(user: RequestUser, data: any) {
    requireWritable(toAccessUser(user));
    validateDepartmentPayload(data);
    const created = await prisma.department.create({
      data: { name: data.name, manager_user_id: data.manager_user_id ? Number(data.manager_user_id) : null },
      include: { _count: { select: { users: true } } },
    });
    const result = publicDepartment(created);
    await writeLog(user, 'create', 'department', created.id, undefined, result);
    return result;
  },

  async updateDepartment(user: RequestUser, id: number, data: any) {
    requireWritable(toAccessUser(user));
    validateDepartmentPayload(data);
    const before = await prisma.department.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
    if (!before) {
      const error = new Error('部门不存在') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }
    const updated = await prisma.department.update({
      where: { id },
      data: { name: data.name, manager_user_id: data.manager_user_id ? Number(data.manager_user_id) : null },
      include: { _count: { select: { users: true } } },
    });
    const result = publicDepartment(updated);
    await writeLog(user, 'update', 'department', id, publicDepartment(before), result);
    return result;
  },
};
