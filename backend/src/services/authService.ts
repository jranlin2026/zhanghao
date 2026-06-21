import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { signToken } from '../config/jwt';

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

export const authService = {
  async login(name: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { name, status: 'active' },
      include: { department: true },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('密码错误');
    }

    return {
      token: signToken({ userId: user.id, name: user.name, roles: [user.role], departmentId: user.department_id }),
      user: toPublicUser(user),
    };
  },

  async getProfile(userId: number) {
    const user = await prisma.user.findFirst({
      where: { id: userId, status: 'active' },
      include: { department: true },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return toPublicUser(user);
  },
};
