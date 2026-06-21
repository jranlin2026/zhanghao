/**
 * riskEngine.test.ts
 * 测试风险规则引擎
 *
 * 使用 vitest mock 模拟 PrismaClient，验证风险规则逻辑
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { riskEngine } from '../../services/riskEngine';

// 模拟 PrismaClient
const mockPrisma = {
  entityRisk: {
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
};

// 在引入 riskEngine 之前 mock PrismaClient
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

describe('riskEngine - scanDevice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('设备无负责人和当前用户时应该触发 DEVICE_NO_OWNER 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const device = {
      id: BigInt(1),
      ownerUserId: null,
      currentUserId: null,
      simType: 'single',
      updatedAt: new Date(),
      _count: { phoneNumbers: 1 },
    };

    const codes = await riskEngine.scanDevice(device);

    expect(codes).toContain('DEVICE_NO_OWNER');
    expect(mockPrisma.entityRisk.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: 'device',
          entityId: BigInt(1),
          riskCode: 'DEVICE_NO_OWNER',
          riskLevel: 'low',
        }),
      }),
    );
  });

  it('设备有负责人和当前用户时不应触发 DEVICE_NO_OWNER 风险', async () => {
    const device = {
      id: BigInt(1),
      ownerUserId: BigInt(1),
      currentUserId: BigInt(1),
      simType: 'single',
      updatedAt: new Date(),
      _count: { phoneNumbers: 1 },
    };

    const codes = await riskEngine.scanDevice(device);

    expect(codes).not.toContain('DEVICE_NO_OWNER');
  });

  it('双卡设备但只有一个手机号时应触发 DEVICE_ABNORMAL 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const device = {
      id: BigInt(2),
      ownerUserId: BigInt(1),
      currentUserId: BigInt(1),
      simType: 'dual',
      updatedAt: new Date(),
      _count: { phoneNumbers: 1 },
    };

    const codes = await riskEngine.scanDevice(device);

    expect(codes).toContain('DEVICE_ABNORMAL');
  });

  it('双卡设备且有两个手机号时不应触发 DEVICE_ABNORMAL 风险', async () => {
    const device = {
      id: BigInt(3),
      ownerUserId: BigInt(1),
      currentUserId: BigInt(1),
      simType: 'dual',
      updatedAt: new Date(),
      _count: { phoneNumbers: 2 },
    };

    const codes = await riskEngine.scanDevice(device);

    expect(codes).not.toContain('DEVICE_ABNORMAL');
  });

  it('设备超过 60 天未更新时应触发 DEVICE_USING_NO_USER 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const device = {
      id: BigInt(4),
      ownerUserId: BigInt(1),
      currentUserId: BigInt(1),
      simType: 'single',
      updatedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 天前
      _count: { phoneNumbers: 1 },
    };

    const codes = await riskEngine.scanDevice(device);

    expect(codes).toContain('DEVICE_USING_NO_USER');
  });

  it('设备最近更新过不应触发 DEVICE_USING_NO_USER 风险', async () => {
    const device = {
      id: BigInt(5),
      ownerUserId: BigInt(1),
      currentUserId: BigInt(1),
      simType: 'single',
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 天前
      _count: { phoneNumbers: 1 },
    };

    const codes = await riskEngine.scanDevice(device);

    expect(codes).not.toContain('DEVICE_USING_NO_USER');
  });

  it('负责人与使用人不同时应触发 DEVICE_NO_PHONE 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const device = {
      id: BigInt(6),
      ownerUserId: BigInt(1),
      currentUserId: BigInt(2),
      simType: 'single',
      updatedAt: new Date(),
      _count: { phoneNumbers: 1 },
    };

    const codes = await riskEngine.scanDevice(device);

    expect(codes).toContain('DEVICE_NO_PHONE');
  });

  it('负责人与使用人相同时不应触发 DEVICE_NO_PHONE 风险', async () => {
    const device = {
      id: BigInt(7),
      ownerUserId: BigInt(1),
      currentUserId: BigInt(1),
      simType: 'single',
      updatedAt: new Date(),
      _count: { phoneNumbers: 1 },
    };

    const codes = await riskEngine.scanDevice(device);

    expect(codes).not.toContain('DEVICE_NO_PHONE');
  });
});

describe('riskEngine - scanPhone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('月消费高于 500 元时应触发 PHONE_HIGH_FEE 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const phone = {
      id: BigInt(1),
      monthlyFee: 600,
      ownerUserId: BigInt(1),
      planType: '基础套餐',
      _count: { internetAccounts: 1 },
    };

    const codes = await riskEngine.scanPhone(phone);

    expect(codes).toContain('PHONE_HIGH_FEE');
    expect(mockPrisma.entityRisk.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: 'phone',
          riskCode: 'PHONE_HIGH_FEE',
        }),
      }),
    );
  });

  it('月消费不超过 500 元时不应触发 PHONE_HIGH_FEE 风险', async () => {
    const phone = {
      id: BigInt(2),
      monthlyFee: 200,
      ownerUserId: BigInt(1),
      planType: '基础套餐',
      _count: { internetAccounts: 1 },
    };

    const codes = await riskEngine.scanPhone(phone);

    expect(codes).not.toContain('PHONE_HIGH_FEE');
  });

  it('无绑定互联网账号时应触发 PHONE_NO_ACCOUNT 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const phone = {
      id: BigInt(3),
      monthlyFee: 100,
      ownerUserId: BigInt(1),
      planType: '基础套餐',
      _count: { internetAccounts: 0 },
    };

    const codes = await riskEngine.scanPhone(phone);

    expect(codes).toContain('PHONE_NO_ACCOUNT');
  });

  it('无负责人时应触发 PHONE_NO_OWNER 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const phone = {
      id: BigInt(4),
      monthlyFee: 100,
      ownerUserId: null,
      planType: '基础套餐',
      _count: { internetAccounts: 1 },
    };

    const codes = await riskEngine.scanPhone(phone);

    expect(codes).toContain('PHONE_NO_OWNER');
  });

  it('无套餐说明时应触发 PHONE_NO_PLAN 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const phone = {
      id: BigInt(5),
      monthlyFee: 100,
      ownerUserId: BigInt(1),
      planType: null,
      _count: { internetAccounts: 1 },
    };

    const codes = await riskEngine.scanPhone(phone);

    expect(codes).toContain('PHONE_NO_PLAN');
  });
});

describe('riskEngine - scanAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('无敏感信息（从未设置密码）时应触发 ACC_NO_REAL_NAME 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const account = {
      id: BigInt(1),
      ownerUserId: BigInt(1),
      permissionStatus: '已授权',
      expireAt: null,
      sensitiveInfo: null,
    };

    const codes = await riskEngine.scanAccount(account);

    expect(codes).toContain('ACC_NO_REAL_NAME');
  });

  it('密码超过 90 天未更新时应触发 ACC_RESIGNED_PENDING 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const account = {
      id: BigInt(2),
      ownerUserId: BigInt(1),
      permissionStatus: '已授权',
      expireAt: null,
      sensitiveInfo: {
        id: BigInt(1),
        passwordUpdatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 天前
      },
    };

    const codes = await riskEngine.scanAccount(account);

    expect(codes).toContain('ACC_RESIGNED_PENDING');
  });

  it('权限已过期时应触发 ACC_ABNORMAL 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const account = {
      id: BigInt(3),
      ownerUserId: BigInt(1),
      permissionStatus: '已过期',
      expireAt: null,
      sensitiveInfo: {
        id: BigInt(3),
        passwordUpdatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    };

    const codes = await riskEngine.scanAccount(account);

    expect(codes).toContain('ACC_ABNORMAL');
  });

  it('即将过期（7天内）时应触发 ACC_USING_NO_USER 风险', async () => {
    mockPrisma.entityRisk.findFirst.mockResolvedValue(null);
    mockPrisma.entityRisk.create.mockResolvedValue({ id: 1 });

    const account = {
      id: BigInt(4),
      ownerUserId: BigInt(1),
      permissionStatus: '已授权',
      expireAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 天后过期
      sensitiveInfo: {
        id: BigInt(4),
        passwordUpdatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    };

    const codes = await riskEngine.scanAccount(account);

    expect(codes).toContain('ACC_USING_NO_USER');
  });

  it('无误账号不应触发任何风险', async () => {
    const account = {
      id: BigInt(5),
      ownerUserId: BigInt(1),
      permissionStatus: '已授权',
      expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 天后过期
      sensitiveInfo: {
        id: BigInt(5),
        passwordUpdatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 天前更新密码
      },
    };

    const codes = await riskEngine.scanAccount(account);

    expect(codes).toHaveLength(0);
  });
});
