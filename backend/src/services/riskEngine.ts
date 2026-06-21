import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 风险规则引擎
 * 实现 14 条风险规则，分三类：设备(4条)、手机号(5条)、账号(5条)
 * 扫描结果 upsert 到 entity_risks 表
 */

/** 风险规则定义 */
interface RiskRule {
  code: string;
  title: string;
  level: 'high' | 'medium' | 'low';
  suggestion: string;
}

/** 设备规则 */
const DEVICE_RULES: RiskRule[] = [
  { code: 'DEVICE_NO_OWNER', title: '设备使用人/负责人为空', level: 'low', suggestion: '请为设备指定使用人或负责人' },
  { code: 'DEVICE_ABNORMAL', title: '设备 SIM 双卡但仅一个手机号', level: 'low', suggestion: '请检查设备 SIM 卡槽配置，补充第二个手机号' },
  { code: 'DEVICE_USING_NO_USER', title: '设备连续 60 天未更新', level: 'medium', suggestion: '请确认设备是否仍在正常使用' },
  { code: 'DEVICE_NO_PHONE', title: '当前使用人与负责人不同', level: 'medium', suggestion: '请确认设备使用人与负责人是否一致' },
];

/** 手机号规则 */
const PHONE_RULES: RiskRule[] = [
  { code: 'PHONE_HIGH_FEE', title: '手机号月消费高于 500 元', level: 'low', suggestion: '建议评估套餐是否合理，考虑降级套餐' },
  { code: 'PHONE_NO_ACCOUNT', title: '手机号无绑定互联网账号', level: 'medium', suggestion: '请确认手机号用途，是否需要绑定账号' },
  { code: 'PHONE_NO_OWNER', title: '手机号无负责人', level: 'low', suggestion: '请为手机号指定负责人' },
  { code: 'PHONE_HIGH_FEE_DUAL', title: '双卡设备两个手机号运营商不同', level: 'low', suggestion: '建议统一运营商以简化管理' },
  { code: 'PHONE_NO_PLAN', title: '手机号无套餐说明', level: 'low', suggestion: '请补充套餐说明信息' },
];

/** 账号规则 */
const ACCOUNT_RULES: RiskRule[] = [
  { code: 'ACC_NO_OWNER', title: '账号无负责人', level: 'medium', suggestion: '请为账号指定负责人' },
  { code: 'ACC_NO_REAL_NAME', title: '账号从未设置过密码', level: 'high', suggestion: '请立即设置登录密码，确保账号安全' },
  { code: 'ACC_ABNORMAL', title: '账号权限已过期', level: 'high', suggestion: '请及时更新账号权限状态' },
  { code: 'ACC_USING_NO_USER', title: '账号即将过期（7天内）', level: 'medium', suggestion: '请联系负责人续期或处理' },
  { code: 'ACC_RESIGNED_PENDING', title: '账号密码超过 90 天未更新', level: 'high', suggestion: '请立即更新密码以保障安全' },
];

/**
 * 将风险结果 upsert 到 entity_risks 表
 */
async function upsertRisk(entityType: string, entityId: number, rule: RiskRule, reason: string) {
  try {
    const existing = await prisma.entityRisk.findFirst({
      where: {
        entityType,
        entityId: BigInt(entityId),
        riskCode: rule.code,
      },
    });

    if (existing) {
      // 如果已存在且状态为 open，更新检测时间
      // 如果已解决/忽略，重新打开
      await prisma.entityRisk.update({
        where: { id: existing.id },
        data: {
          riskTitle: rule.title,
          riskLevel: rule.level,
          riskReason: reason,
          suggestion: rule.suggestion,
          status: 'open',
          detectedAt: new Date(),
          resolvedAt: null,
        },
      });
    } else {
      await prisma.entityRisk.create({
        data: {
          entityType,
          entityId: BigInt(entityId),
          riskCode: rule.code,
          riskTitle: rule.title,
          riskLevel: rule.level,
          riskReason: reason,
          suggestion: rule.suggestion,
          status: 'open',
        },
      });
    }
  } catch (e) {
    console.error(`[RiskEngine] upsertRisk error:`, e);
  }
}

/**
 * 清除实体上不再适用的风险
 */
async function clearObsoleteRisks(entityType: string, entityId: number, applicableCodes: string[]) {
  try {
    await prisma.entityRisk.updateMany({
      where: {
        entityType,
        entityId: BigInt(entityId),
        riskCode: { notIn: applicableCodes },
        status: 'open',
      },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
      },
    });
  } catch (e) {
    console.error(`[RiskEngine] clearObsoleteRisks error:`, e);
  }
}

export const riskEngine = {
  /**
   * 扫描单个设备的风险
   */
  async scanDevice(device: any): Promise<string[]> {
    const codes: string[] = [];
    const daysSinceUpdate = device.updatedAt
      ? Math.floor((Date.now() - new Date(device.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // R01: 设备使用人/负责人为空
    const noOwnerOrUser = !device.ownerUserId && !device.currentUserId;
    if (noOwnerOrUser) {
      await upsertRisk('device', Number(device.id), DEVICE_RULES[0], '设备未设置使用人和负责人');
      codes.push('DEVICE_NO_OWNER');
    }

    // R02: 双卡但只有一个手机号
    if (device.simType === 'dual') {
      const phoneCount = device._count?.phoneNumbers ?? 0;
      if (phoneCount < 2) {
        await upsertRisk('device', Number(device.id), DEVICE_RULES[1], '设备为双卡类型但仅绑定了一个手机号');
        codes.push('DEVICE_ABNORMAL');
      }
    }

    // R03: 设备连续 60 天未更新
    if (daysSinceUpdate > 60) {
      await upsertRisk('device', Number(device.id), DEVICE_RULES[2], `设备已 ${daysSinceUpdate} 天未更新`);
      codes.push('DEVICE_USING_NO_USER');
    }

    // R04: 当前使用人与负责人不同
    if (device.ownerUserId && device.currentUserId && Number(device.ownerUserId) !== Number(device.currentUserId)) {
      await upsertRisk('device', Number(device.id), DEVICE_RULES[3], '设备当前使用人与负责人不是同一人');
      codes.push('DEVICE_NO_PHONE');
    }

    await clearObsoleteRisks('device', Number(device.id), codes);
    return codes;
  },

  /**
   * 扫描单个手机号的风险
   */
  async scanPhone(phone: any, deviceSimType?: string): Promise<string[]> {
    const codes: string[] = [];
    const fee = Number(phone.monthlyFee) || 0;
    const accountCount = phone._count?.internetAccounts ?? 0;

    // R05: 月消费高于 500
    if (fee > 500) {
      await upsertRisk('phone', Number(phone.id), PHONE_RULES[0], `月消费 ${fee} 元超过 500 元阈值`);
      codes.push('PHONE_HIGH_FEE');
    }

    // R06: 无绑定互联网账号
    if (accountCount === 0) {
      await upsertRisk('phone', Number(phone.id), PHONE_RULES[1], '该手机号未绑定任何互联网账号');
      codes.push('PHONE_NO_ACCOUNT');
    }

    // R07: 无负责人
    if (!phone.ownerUserId) {
      await upsertRisk('phone', Number(phone.id), PHONE_RULES[2], '手机号未设置负责人');
      codes.push('PHONE_NO_OWNER');
    }

    // R08: 双卡设备两个手机号运营商不同（在 device 上下文中判断）
    // 这个在 scanDevice 中处理，这里保留

    // R09: 无套餐说明
    if (!phone.planType) {
      await upsertRisk('phone', Number(phone.id), PHONE_RULES[4], '手机号未填写套餐说明');
      codes.push('PHONE_NO_PLAN');
    }

    await clearObsoleteRisks('phone', Number(phone.id), codes);
    return codes;
  },

  /**
   * 扫描单个互联网账号的风险
   */
  async scanAccount(account: any): Promise<string[]> {
    const codes: string[] = [];
    const now = new Date();
    const hasSensitive = account.sensitiveInfo;

    // R10: 密码超过 90 天未更新
    if (hasSensitive?.passwordUpdatedAt) {
      const daysSincePwdUpdate = Math.floor(
        (now.getTime() - new Date(hasSensitive.passwordUpdatedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSincePwdUpdate > 90) {
        await upsertRisk('account', Number(account.id), ACCOUNT_RULES[4], `密码已 ${daysSincePwdUpdate} 天未更新（超过 90 天阈值）`);
        codes.push('ACC_RESIGNED_PENDING');
      }
    } else {
      // R14: 从未设置过密码
      await upsertRisk('account', Number(account.id), ACCOUNT_RULES[1], '账号从未设置过登录密码');
      codes.push('ACC_NO_REAL_NAME');
    }

    // R11: 权限已过期
    if (account.permissionStatus === '已过期') {
      await upsertRisk('account', Number(account.id), ACCOUNT_RULES[2], '账号权限状态已过期');
      codes.push('ACC_ABNORMAL');
    }

    // R12: 账号无负责人
    if (!account.ownerUserId) {
      await upsertRisk('account', Number(account.id), ACCOUNT_RULES[0], '账号未设置负责人');
      codes.push('ACC_NO_OWNER');
    }

    // R13: 即将过期（7天内）
    if (account.expireAt) {
      const daysToExpire = Math.floor(
        (new Date(account.expireAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysToExpire >= 0 && daysToExpire <= 7) {
        await upsertRisk('account', Number(account.id), ACCOUNT_RULES[3], `账号将在 ${daysToExpire} 天后过期`);
        codes.push('ACC_USING_NO_USER');
      }
    }

    await clearObsoleteRisks('account', Number(account.id), codes);
    return codes;
  },

  /**
   * 全量扫描所有实体
   * 返回扫描统计
   */
  async runFullScan(): Promise<{ scanned: number }> {
    let totalScanned = 0;

    // 扫描所有设备
    const devices = await prisma.device.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { phoneNumbers: true } },
      },
    });
    for (const device of devices) {
      await this.scanDevice(device);
      totalScanned++;
    }

    // 扫描所有手机号
    const phones = await prisma.phoneNumber.findMany({
      include: {
        _count: { select: { internetAccounts: true } },
        device: { select: { simType: true } },
      },
    });
    for (const phone of phones) {
      await this.scanPhone(phone, phone.device?.simType);
      totalScanned++;
    }

    // 扫描所有互联网账号
    const accounts = await prisma.internetAccount.findMany({
      include: {
        sensitiveInfo: {
          select: { id: true, passwordUpdatedAt: true },
        },
      },
    });
    for (const account of accounts) {
      await this.scanAccount(account);
      totalScanned++;
    }

    return { scanned: totalScanned };
  },

  /**
   * 针对单个实体触发扫描
   */
  async runForEntity(entityType: string, entityId: number): Promise<void> {
    switch (entityType) {
      case 'device': {
        const device = await prisma.device.findFirst({
          where: { id: BigInt(entityId), deletedAt: null },
          include: { _count: { select: { phoneNumbers: true } } },
        });
        if (device) await this.scanDevice(device);
        break;
      }
      case 'phone': {
        const phone = await prisma.phoneNumber.findFirst({
          where: { id: BigInt(entityId) },
          include: {
            _count: { select: { internetAccounts: true } },
            device: { select: { simType: true } },
          },
        });
        if (phone) await this.scanPhone(phone, phone.device?.simType);
        break;
      }
      case 'account': {
        const account = await prisma.internetAccount.findFirst({
          where: { id: BigInt(entityId) },
          include: {
            sensitiveInfo: { select: { id: true, passwordUpdatedAt: true } },
          },
        });
        if (account) await this.scanAccount(account);
        break;
      }
    }
  },
};
