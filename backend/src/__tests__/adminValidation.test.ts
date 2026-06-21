import { describe, expect, it } from 'vitest';
import { validateDepartmentPayload, validateUserPayload } from '../services/adminValidation';

describe('admin management validation', () => {
  it('rejects invalid user roles and statuses', () => {
    expect(() => validateUserPayload({ name: '张三', role: 'root', status: 'active' })).toThrow('角色不正确');
    expect(() => validateUserPayload({ name: '张三', role: 'admin', status: 'locked' })).toThrow('用户状态不正确');
  });

  it('requires strong enough passwords when present', () => {
    expect(() => validateUserPayload({ name: '张三', role: 'employee', status: 'active', password: '12345' })).toThrow('密码至少 6 位');
  });

  it('requires department names', () => {
    expect(() => validateDepartmentPayload({ name: '' })).toThrow('部门名称不能为空');
  });
});
