import { PrismaClient } from '@prisma/client';
import { buildFindManyParams, wrapPaginatedResult, type PaginationInput, type PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

/** 操作日志查询参数 */
interface LogQueryInput extends PaginationInput {
  operator_id?: number;
  action_type?: string;
  target_type?: string;
  target_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * 操作日志服务
 */
export const logService = {
  /**
   * 创建操作日志
   */
  async create(data: {
    operator_id: number;
    action_type: string;
    target_type: string;
    target_id?: number;
    target_name?: string;
    before_data?: Record<string, unknown>;
    after_data?: Record<string, unknown>;
    ip_address?: string;
    device_info?: string;
    remark?: string;
  }) {
    const log = await prisma.operationLog.create({
      data: {
        operatorId: BigInt(data.operator_id),
        actionType: data.action_type,
        targetType: data.target_type,
        targetId: data.target_id ? BigInt(data.target_id) : null,
        targetName: data.target_name || null,
        beforeData: data.before_data || null,
        afterData: data.after_data || null,
        ipAddress: data.ip_address || null,
        deviceInfo: data.device_info || null,
        remark: data.remark || null,
      },
    });
    return log;
  },

  /**
   * 查询操作日志（分页/筛选）
   */
  async findMany(params: LogQueryInput): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (params.operator_id) where.operatorId = BigInt(params.operator_id);
    if (params.action_type) where.actionType = params.action_type;
    if (params.target_type) where.targetType = params.target_type;
    if (params.target_id) where.targetId = BigInt(params.target_id);
    if (params.search) {
      where.OR = [
        { targetName: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.start_date || params.end_date) {
      where.createdAt = {};
      if (params.start_date) where.createdAt.gte = new Date(params.start_date);
      if (params.end_date) where.createdAt.lte = new Date(params.end_date);
    }

    const { skip, take, orderBy } = buildFindManyParams(params, where);
    const [logs, total] = await Promise.all([
      prisma.operationLog.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          operator: { select: { id: true, name: true } },
        },
      }),
      prisma.operationLog.count({ where }),
    ]);

    return wrapPaginatedResult(logs, total, params.page || 1, params.pageSize || 50);
  },
};
