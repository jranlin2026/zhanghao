import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { prisma } from '../config/db';
import { signToken } from '../config/jwt';
import { demoStore } from './demoStore';

function toPublicUser(user: {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  department_id: number | null;
  status: string;
  department?: { id: number; name: string } | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    roles: [user.role],
    department_id: user.department_id,
    department_name: user.department?.name ?? null,
    status: user.status,
  };
}

function authError(message: string): Error & { statusCode?: number } {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 401;
  return error;
}

export const authService = {
  async login(name: string, password: string) {
    if (env.DEV_DEMO_MODE) return demoStore.login(name, password);

    const user = await prisma.user.findFirst({
      where: { name, status: 'active' },
      include: { department: true },
    });

    if (!user) {
      throw authError('用户名或密码错误');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw authError('用户名或密码错误');
    }

    return {
      token: signToken({ userId: user.id, name: user.name, roles: [user.role], departmentId: user.department_id }),
      user: toPublicUser(user),
    };
  },

  async getProfile(userId: number) {
    if (env.DEV_DEMO_MODE) return demoStore.getProfile(userId);

    const user = await prisma.user.findFirst({
      where: { id: userId, status: 'active' },
      include: { department: true },
    });

    if (!user) {
      throw authError('用户不存在');
    }

    return toPublicUser(user);
  },
};
