/**
 * constants.test.ts
 * 测试枚举常量与字典数据的正确性
 */
import { describe, it, expect } from 'vitest';
import {
  PLATFORM_TYPES,
  ROLE_CODES,
  ROLE_LABELS,
  STATUSES,
  DEVICE_STATUSES,
  PHONE_STATUSES,
  ACCOUNT_STATUSES,
  SIM_TYPES,
  ENTITY_TYPES,
  RISK_LEVELS,
  PERMISSION_STATUSES,
  OWNER_SUBJECTS,
  CARRIERS,
  ACTION_TYPES,
  RISK_CODES,
  PREDEFINED_DEPARTMENTS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../constants';

describe('PLATFORM_TYPES', () => {
  it('应该包含 14 个平台', () => {
    expect(PLATFORM_TYPES).toHaveLength(14);
  });

  it('应该包含微信和抖音', () => {
    expect(PLATFORM_TYPES).toContain('微信');
    expect(PLATFORM_TYPES).toContain('抖音');
  });

  it('应该包含所有主要平台', () => {
    const expected = ['微信', '抖音', '小红书', '快手', 'TikTok', 'Google', 'QQ', '微博', 'B站', '淘宝', '京东', '拼多多', '美团', '其他'];
    for (const p of expected) {
      expect(PLATFORM_TYPES).toContain(p);
    }
  });

  it('应该为只读常量数组', () => {
    expect(() => {
      (PLATFORM_TYPES as unknown as string[]).push('测试');
    }).toThrow();
  });
});

describe('ROLE_CODES', () => {
  it('应该包含 5 种角色编码', () => {
    expect(ROLE_CODES).toHaveLength(5);
  });

  it('应该包含所有角色编码', () => {
    expect(ROLE_CODES).toContain('super_admin');
    expect(ROLE_CODES).toContain('boss');
    expect(ROLE_CODES).toContain('account_admin');
    expect(ROLE_CODES).toContain('dept_manager');
    expect(ROLE_CODES).toContain('employee');
  });
});

describe('ROLE_LABELS', () => {
  it('应该为每个角色编码提供对应的中文标签', () => {
    expect(ROLE_LABELS.super_admin).toBe('超级管理员');
    expect(ROLE_LABELS.boss).toBe('老板');
    expect(ROLE_LABELS.account_admin).toBe('账号管理员');
    expect(ROLE_LABELS.dept_manager).toBe('部门负责人');
    expect(ROLE_LABELS.employee).toBe('普通员工');
  });
});

describe('STATUSES', () => {
  it('应该包含 3 种状态', () => {
    expect(STATUSES).toHaveLength(3);
  });

  it('应该包含启用中、闲置和已注销', () => {
    expect(STATUSES).toContain('启用中');
    expect(STATUSES).toContain('闲置');
    expect(STATUSES).toContain('已注销');
  });
});

describe('实体状态数组', () => {
  it('DEVICE_STATUSES 应该包含 3 种状态', () => {
    expect(DEVICE_STATUSES).toEqual(['启用中', '闲置', '已注销']);
  });

  it('PHONE_STATUSES 应该包含 3 种状态', () => {
    expect(PHONE_STATUSES).toEqual(['启用中', '闲置', '已注销']);
  });

  it('ACCOUNT_STATUSES 应该包含 3 种状态', () => {
    expect(ACCOUNT_STATUSES).toEqual(['启用中', '闲置', '已注销']);
  });
});

describe('SIM_TYPES', () => {
  it('应该包含 2 种 SIM 类型', () => {
    expect(SIM_TYPES).toHaveLength(2);
    expect(SIM_TYPES).toContain('single');
    expect(SIM_TYPES).toContain('dual');
  });
});

describe('ENTITY_TYPES', () => {
  it('应该包含 3 种实体类型', () => {
    expect(ENTITY_TYPES).toHaveLength(3);
    expect(ENTITY_TYPES).toContain('device');
    expect(ENTITY_TYPES).toContain('phone');
    expect(ENTITY_TYPES).toContain('account');
  });
});

describe('RISK_LEVELS', () => {
  it('应该包含 4 种风险等级', () => {
    expect(RISK_LEVELS).toHaveLength(4);
    expect(RISK_LEVELS).toContain('high');
    expect(RISK_LEVELS).toContain('medium');
    expect(RISK_LEVELS).toContain('low');
    expect(RISK_LEVELS).toContain('none');
  });
});

describe('PERMISSION_STATUSES', () => {
  it('应该包含 3 种权限状态', () => {
    expect(PERMISSION_STATUSES).toHaveLength(3);
    expect(PERMISSION_STATUSES).toContain('已授权');
    expect(PERMISSION_STATUSES).toContain('待授权');
    expect(PERMISSION_STATUSES).toContain('已过期');
  });
});

describe('OWNER_SUBJECTS', () => {
  it('应该包含 6 种所属主体', () => {
    expect(OWNER_SUBJECTS).toHaveLength(6);
    expect(OWNER_SUBJECTS).toContain('公司');
    expect(OWNER_SUBJECTS).toContain('法人');
    expect(OWNER_SUBJECTS).toContain('员工个人');
    expect(OWNER_SUBJECTS).toContain('客户');
    expect(OWNER_SUBJECTS).toContain('代理');
    expect(OWNER_SUBJECTS).toContain('其他');
  });
});

describe('CARRIERS', () => {
  it('应该包含 4 种运营商', () => {
    expect(CARRIERS).toHaveLength(4);
    expect(CARRIERS).toContain('中国移动');
    expect(CARRIERS).toContain('中国联通');
    expect(CARRIERS).toContain('中国电信');
    expect(CARRIERS).toContain('虚拟运营商');
  });
});

describe('ACTION_TYPES', () => {
  it('应该包含所有操作类型', () => {
    expect(ACTION_TYPES.CREATE_DEVICE).toBe('新增设备');
    expect(ACTION_TYPES.UPDATE_DEVICE).toBe('编辑设备');
    expect(ACTION_TYPES.DELETE_DEVICE).toBe('删除设备');
    expect(ACTION_TYPES.IMPORT_DATA).toBe('导入数据');
    expect(ACTION_TYPES.EXPORT_DATA).toBe('导出数据');
    expect(ACTION_TYPES.BATCH_OPERATION).toBe('批量操作');
  });
});

describe('RISK_CODES', () => {
  it('应该包含所有风险编码常量', () => {
    expect(RISK_CODES.DEVICE_NO_OWNER).toBe('DEVICE_NO_OWNER');
    expect(RISK_CODES.PHONE_HIGH_FEE).toBe('PHONE_HIGH_FEE');
    expect(RISK_CODES.ACC_NO_REAL_NAME).toBe('ACC_NO_REAL_NAME');
    expect(RISK_CODES.ACC_RESIGNED_PENDING).toBe('ACC_RESIGNED_PENDING');
  });
});

describe('PREDEFINED_DEPARTMENTS', () => {
  it('应该包含 6 个预定义部门', () => {
    expect(PREDEFINED_DEPARTMENTS).toHaveLength(6);
  });

  it('每个部门应该有 id 和 name', () => {
    for (const dept of PREDEFINED_DEPARTMENTS) {
      expect(dept).toHaveProperty('id');
      expect(dept).toHaveProperty('name');
    }
  });
});

describe('分页默认值', () => {
  it('DEFAULT_PAGE_SIZE 应为 50', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(50);
  });

  it('PAGE_SIZE_OPTIONS 应包含 [20, 50, 100]', () => {
    expect(PAGE_SIZE_OPTIONS).toEqual([20, 50, 100]);
  });
});
