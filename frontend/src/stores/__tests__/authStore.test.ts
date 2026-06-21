/**
 * authStore.test.ts
 * 测试认证/用户角色状态管理
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '../authStore';
import type { UserDTO } from '@/types/auth';

// 测试用户数据
const mockUser: UserDTO = {
  id: 1,
  name: '测试用户',
  email: 'test@example.com',
  phone: '13800138000',
  department_id: 1,
  department_name: '技术部',
  status: 'active',
  roles: ['account_admin', 'dept_manager'],
};

const mockSuperAdmin: UserDTO = {
  id: 2,
  name: '超级管理员',
  email: 'admin@example.com',
  phone: null,
  department_id: null,
  status: 'active',
  roles: ['super_admin'],
};

const mockEmployee: UserDTO = {
  id: 3,
  name: '普通员工',
  email: 'emp@example.com',
  phone: null,
  department_id: 2,
  department_name: '运营部',
  status: 'active',
  roles: ['employee'],
};

describe('authStore', () => {
  beforeEach(() => {
    // 每次测试前重置 store 状态
    useAuthStore.setState({
      user: null,
      token: null,
      roles: [],
      isAuthenticated: false,
    });
    // 清理 localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初始状态', () => {
    it('初始状态应未登录', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.roles).toEqual([]);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('login 后应更新为已登录状态', () => {
      const token = 'test-jwt-token';
      useAuthStore.getState().login(mockUser, token);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(token);
      expect(state.roles).toEqual(['account_admin', 'dept_manager']);
      expect(state.isAuthenticated).toBe(true);
    });

    it('login 后应将 token 保存到 localStorage', () => {
      const token = 'test-jwt-token';
      useAuthStore.getState().login(mockUser, token);

      expect(localStorage.getItem('token')).toBe(token);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });
  });

  describe('logout', () => {
    it('logout 后应重置为未登录状态', () => {
      // 先登录
      useAuthStore.getState().login(mockUser, 'token-123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // 再登出
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.roles).toEqual([]);
      expect(state.isAuthenticated).toBe(false);
    });

    it('logout 后应清除 localStorage', () => {
      useAuthStore.getState().login(mockUser, 'token-123');
      expect(localStorage.getItem('token')).toBe('token-123');

      useAuthStore.getState().logout();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('setAuth', () => {
    it('setAuth 应正确设置用户信息和 token', () => {
      const token = 'set-auth-token';
      useAuthStore.getState().setAuth(mockUser, token);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('hasPermission', () => {
    it('超级管理员应拥有所有权限', () => {
      useAuthStore.getState().login(mockSuperAdmin, 'admin-token');
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission(['employee'])).toBe(true);
      expect(hasPermission(['account_admin'])).toBe(true);
      expect(hasPermission(['dept_manager'])).toBe(true);
      expect(hasPermission(['super_admin'])).toBe(true);
      expect(hasPermission(['nonexistent_role'])).toBe(true);
    });

    it('空角色列表时 should return true', () => {
      useAuthStore.getState().login(mockUser, 'token');
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission([])).toBe(true);
    });

    it('应正确校验用户是否拥有指定角色之一', () => {
      useAuthStore.getState().login(mockUser, 'token');
      const { hasPermission } = useAuthStore.getState();

      // 用户拥有 account_admin 和 dept_manager
      expect(hasPermission(['account_admin'])).toBe(true);
      expect(hasPermission(['dept_manager'])).toBe(true);
      expect(hasPermission(['boss'])).toBe(false);
      expect(hasPermission(['employee'])).toBe(false);
    });

    it('拥有多个角色中的任意一个即返回 true', () => {
      useAuthStore.getState().login(mockUser, 'token');
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission(['boss', 'account_admin'])).toBe(true);
      expect(hasPermission(['boss', 'employee'])).toBe(false);
    });

    it('未登录用户应无权限', () => {
      const { hasPermission } = useAuthStore.getState();
      expect(hasPermission(['account_admin'])).toBe(false);
      expect(hasPermission([])).toBe(true); // 空列表仍返回 true
    });
  });

  describe('hydrate', () => {
    it('localStorage 有数据时 hydrate 应恢复登录态', () => {
      localStorage.setItem('token', 'stored-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('stored-token');
    });

    it('localStorage 无数据时 hydrate 不应改变状态', () => {
      useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('localStorage 中 user 数据异常时应清除登录态', () => {
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', '{invalid-json}');

      useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
