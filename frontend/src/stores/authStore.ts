import { create } from 'zustand';
import type { UserDTO } from '@/types/auth';

/**
 * 认证/用户角色状态管理
 */
interface AuthState {
  /** 当前登录用户 */
  user: UserDTO | null;
  /** JWT Token */
  token: string | null;
  /** 用户角色编码列表 */
  roles: string[];
  /** 是否已登录 */
  isAuthenticated: boolean;

  /** 设置用户信息和 Token */
  setAuth: (user: UserDTO, token: string) => void;
  /** 登录 */
  login: (user: UserDTO, token: string) => void;
  /** 退出登录 */
  logout: () => void;
  /** 检查是否拥有指定角色 */
  hasPermission: (requiredRoles: string[]) => boolean;
  /** 从 localStorage 恢复登录态 */
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  roles: [],
  isAuthenticated: false,

  setAuth: (user: UserDTO, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      roles: user.roles || [],
      isAuthenticated: true,
    });
  },

  login: (user: UserDTO, token: string) => {
    get().setAuth(user, token);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      roles: [],
      isAuthenticated: false,
    });
  },

  hasPermission: (requiredRoles: string[]) => {
    const { roles } = get();
    if (roles.includes('super_admin')) return true;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.some((role) => roles.includes(role));
  },

  hydrate: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserDTO;
        set({
          user,
          token,
          roles: user.roles || [],
          isAuthenticated: true,
        });
      } catch {
        // 数据异常，清除登录态
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },
}));
