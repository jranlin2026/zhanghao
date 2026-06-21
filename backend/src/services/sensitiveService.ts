import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../config/crypto';
import { logAudit } from '../middleware/auditLog';

const prisma = new PrismaClient();

/**
 * 敏感信息加解密服务
 * 负责敏感信息的查询（解密）、更新（加密）和审计日志记录
 */
export const sensitiveService = {

  /**
   * 查看敏感信息（解密返回明文，记录审计日志）
   * @param accountId 账号 ID
   * @param userId 操作人 ID
   * @param req Express Request 对象（用于审计日志）
   */
  async viewSensitive(accountId: number, userId: number, req?: any) {
    // 查询加密数据
    const sensitiveInfo = await prisma.accountSensitiveInfo.findUnique({
      where: { accountId: BigInt(accountId) },
    });

    if (!sensitiveInfo) {
      throw new Error('未找到敏感信息');
    }

    // 解密各字段
    const result: Record<string, any> = {
      id: Number(sensitiveInfo.id),
      account_id: accountId,
      login_password: null,
      real_name_info: null,
      backup_info: null,
      password_updated_at: sensitiveInfo.passwordUpdatedAt,
      has_password: !!sensitiveInfo.loginPasswordEncrypted,
      has_real_name: !!sensitiveInfo.realNameInfoEncrypted,
    };

    if (sensitiveInfo.loginPasswordEncrypted) {
      result.login_password = decrypt(sensitiveInfo.loginPasswordEncrypted);
    }
    if (sensitiveInfo.realNameInfoEncrypted) {
      result.real_name_info = decrypt(sensitiveInfo.realNameInfoEncrypted);
    }
    if (sensitiveInfo.backupInfoEncrypted) {
      result.backup_info = decrypt(sensitiveInfo.backupInfoEncrypted);
    }

    // 记录审计日志
    try {
      const account = await prisma.internetAccount.findUnique({
        where: { id: BigInt(accountId) },
        select: { accountCode: true, accountName: true },
      });
      if (req) {
        await logAudit(req, {
          actionType: 'VIEW_SENSITIVE',
          targetType: 'internet_accounts',
          targetId: accountId,
          targetName: account?.accountName || `账号#${accountId}`,
          remark: `查看敏感信息（账号: ${account?.accountCode || accountId}）`,
        });
      } else {
        // 无 req 对象时直接写入
        await prisma.operationLog.create({
          data: {
            operatorId: BigInt(userId),
            actionType: 'VIEW_SENSITIVE',
            targetType: 'internet_accounts',
            targetId: BigInt(accountId),
            targetName: account?.accountName || `账号#${accountId}`,
            remark: `查看敏感信息（账号: ${account?.accountCode || accountId}）`,
          },
        });
      }
    } catch (e) {
      console.error('[SensitiveService] 审计日志写入失败:', e);
    }

    return { code: 200, data: result, message: 'success' };
  },

  /**
   * 复制敏感字段（记录审计日志）
   * @param accountId 账号 ID
   * @param field 字段名
   * @param userId 操作人 ID
   * @param req Express Request 对象
   */
  async copySensitiveField(accountId: number, field: string, userId: number, req?: any) {
    const sensitiveInfo = await prisma.accountSensitiveInfo.findUnique({
      where: { accountId: BigInt(accountId) },
    });

    if (!sensitiveInfo) {
      throw new Error('未找到敏感信息');
    }

    let plainText = '';
    let fieldLabel = '';
    if (field === 'login_password') {
      if (!sensitiveInfo.loginPasswordEncrypted) throw new Error('登录密码未设置');
      plainText = decrypt(sensitiveInfo.loginPasswordEncrypted);
      fieldLabel = '登录密码';
    } else if (field === 'real_name_info') {
      if (!sensitiveInfo.realNameInfoEncrypted) throw new Error('实名信息未设置');
      plainText = decrypt(sensitiveInfo.realNameInfoEncrypted);
      fieldLabel = '实名信息';
    } else if (field === 'backup_info') {
      if (!sensitiveInfo.backupInfoEncrypted) throw new Error('备份信息未设置');
      plainText = decrypt(sensitiveInfo.backupInfoEncrypted);
      fieldLabel = '备份信息';
    } else {
      throw new Error('无效的敏感字段');
    }

    // 记录审计日志
    try {
      const account = await prisma.internetAccount.findUnique({
        where: { id: BigInt(accountId) },
        select: { accountCode: true, accountName: true },
      });
      if (req) {
        await logAudit(req, {
          actionType: 'COPY_SENSITIVE',
          targetType: 'internet_accounts',
          targetId: accountId,
          targetName: account?.accountName || `账号#${accountId}`,
          remark: `复制敏感字段【${fieldLabel}】（账号: ${account?.accountCode || accountId}）`,
        });
      } else {
        await prisma.operationLog.create({
          data: {
            operatorId: BigInt(userId),
            actionType: 'COPY_SENSITIVE',
            targetType: 'internet_accounts',
            targetId: BigInt(accountId),
            targetName: account?.accountName || `账号#${accountId}`,
            remark: `复制敏感字段【${fieldLabel}】（账号: ${account?.accountCode || accountId}）`,
          },
        });
      }
    } catch (e) {
      console.error('[SensitiveService] 审计日志写入失败:', e);
    }

    return { code: 200, data: plainText, message: 'success' };
  },

  /**
   * 修改敏感信息（加密存储 + 审计日志）
   * @param accountId 账号 ID
   * @param data 敏感数据
   * @param userId 操作人 ID
   * @param req Express Request 对象
   */
  async updateSensitive(accountId: number, data: { login_password?: string; real_name_info?: string; backup_info?: string }, userId: number, req?: any) {
    const updateData: any = {};
    const now = new Date();

    if (data.login_password !== undefined) {
      updateData.loginPasswordEncrypted = data.login_password ? encrypt(data.login_password) : null;
      updateData.passwordUpdatedAt = now;
    }
    if (data.real_name_info !== undefined) {
      updateData.realNameInfoEncrypted = data.real_name_info ? encrypt(data.real_name_info) : null;
    }
    if (data.backup_info !== undefined) {
      updateData.backupInfoEncrypted = data.backup_info ? encrypt(data.backup_info) : null;
    }

    // Upsert: 如果存在则更新，不存在则创建
    const result = await prisma.accountSensitiveInfo.upsert({
      where: { accountId: BigInt(accountId) },
      create: {
        accountId: BigInt(accountId),
        ...updateData,
      },
      update: updateData,
    });

    // 记录审计日志
    try {
      const account = await prisma.internetAccount.findUnique({
        where: { id: BigInt(accountId) },
        select: { accountCode: true, accountName: true },
      });
      if (req) {
        await logAudit(req, {
          actionType: 'UPDATE_SENSITIVE',
          targetType: 'internet_accounts',
          targetId: accountId,
          targetName: account?.accountName || `账号#${accountId}`,
          afterData: { fields: Object.keys(data) },
          remark: `修改敏感信息（账号: ${account?.accountCode || accountId}）`,
        });
      } else {
        await prisma.operationLog.create({
          data: {
            operatorId: BigInt(userId),
            actionType: 'UPDATE_SENSITIVE',
            targetType: 'internet_accounts',
            targetId: BigInt(accountId),
            targetName: account?.accountName || `账号#${accountId}`,
            afterData: { fields: Object.keys(data) },
            remark: `修改敏感信息（账号: ${account?.accountCode || accountId}）`,
          },
        });
      }
    } catch (e) {
      console.error('[SensitiveService] 审计日志写入失败:', e);
    }

    return {
      code: 200,
      data: {
        id: Number(result.id),
        account_id: accountId,
        password_updated_at: result.passwordUpdatedAt,
        has_password: !!result.loginPasswordEncrypted,
        has_real_name: !!result.realNameInfoEncrypted,
      },
      message: '敏感信息已更新',
    };
  },
};
