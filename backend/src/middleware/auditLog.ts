import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 审计日志中间件
 * 记录所有写操作到 operation_logs 表
 *
 * 用法: 在 Controller 中调用 logAudit(req, { actionType, targetType, targetId, targetName, afterData })
 */

export interface AuditLogInput {
  /** 操作类型，如 CREATE_DEVICE */
  actionType: string;
  /** 目标实体类型 */
  targetType: string;
  /** 目标实体 ID */
  targetId?: number;
  /** 目标实体名称 */
  targetName?: string;
  /** 修改前数据 */
  beforeData?: Record<string, unknown>;
  /** 修改后数据 */
  afterData?: Record<string, unknown>;
  /** 备注 */
  remark?: string;
}

/**
 * 写入审计日志
 */
export async function logAudit(req: Request, input: AuditLogInput): Promise<void> {
  if (!req.user) return;

  try {
    await prisma.operationLog.create({
      data: {
        operatorId: Number(req.user.id),
        actionType: input.actionType,
        targetType: input.targetType,
        targetId: input.targetId ? BigInt(input.targetId) : null,
        targetName: input.targetName || null,
        beforeData: input.beforeData || null,
        afterData: input.afterData || null,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        deviceInfo: req.headers['user-agent'] || null,
        remark: input.remark || null,
      },
    });
  } catch (error) {
    // 审计日志写失败不应影响主操作
    console.error('[AuditLog] 写入审计日志失败:', error);
  }
}
