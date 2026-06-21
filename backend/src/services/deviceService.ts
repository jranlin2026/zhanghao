import { PrismaClient } from '@prisma/client';
import { generateDeviceCode } from '../utils/codegen';
import { buildFindManyParams, wrapPaginatedResult, type PaginationInput, type PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

/** 设备创建输入 */
interface CreateDeviceInput {
  device_name: string;
  brand_model: string;
  imei: string;
  sim_type: string;
  owner_subject: string;
  department_id?: number | null;
  owner_user_id?: number | null;
  current_user_id?: number | null;
  status?: string;
  risk_level?: string;
  remark?: string | null;
  created_by?: number | null;
}

/** 设备更新输入 */
type UpdateDeviceInput = Partial<CreateDeviceInput> & { updated_by?: number | null };

/** 设备查询参数 */
interface DeviceQueryInput extends PaginationInput {
  search?: string;
  status?: string;
  risk_level?: string;
  department_id?: number;
  owner_user_id?: number;
  sim_type?: string;
}

/**
 * 设备 CRUD 服务
 */
export const deviceService = {
  /**
   * 创建设备
   * 自动生成 device_code
   */
  async create(data: CreateDeviceInput) {
    const device = await prisma.device.create({
      data: {
        deviceCode: generateDeviceCode(),
        deviceName: data.device_name,
        brandModel: data.brand_model,
        imei: data.imei,
        simType: data.sim_type,
        ownerSubject: data.owner_subject,
        departmentId: data.department_id ? BigInt(data.department_id) : null,
        ownerUserId: data.owner_user_id ? BigInt(data.owner_user_id) : null,
        currentUserId: data.current_user_id ? BigInt(data.current_user_id) : null,
        status: data.status || '启用中',
        riskLevel: data.risk_level || 'none',
        remark: data.remark || null,
        createdBy: data.created_by ? BigInt(data.created_by) : null,
      },
      include: {
        owner: { select: { id: true, name: true } },
        currentUser: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    return device;
  },

  /**
   * 更新设备
   */
  async update(id: number, data: UpdateDeviceInput) {
    const updateData: any = {};
    if (data.device_name !== undefined) updateData.deviceName = data.device_name;
    if (data.brand_model !== undefined) updateData.brandModel = data.brand_model;
    if (data.imei !== undefined) updateData.imei = data.imei;
    if (data.sim_type !== undefined) updateData.simType = data.sim_type;
    if (data.owner_subject !== undefined) updateData.ownerSubject = data.owner_subject;
    if (data.department_id !== undefined) updateData.departmentId = data.department_id ? BigInt(data.department_id) : null;
    if (data.owner_user_id !== undefined) updateData.ownerUserId = data.owner_user_id ? BigInt(data.owner_user_id) : null;
    if (data.current_user_id !== undefined) updateData.currentUserId = data.current_user_id ? BigInt(data.current_user_id) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.risk_level !== undefined) updateData.riskLevel = data.risk_level;
    if (data.remark !== undefined) updateData.remark = data.remark;
    if (data.updated_by !== undefined) updateData.updatedBy = data.updated_by ? BigInt(data.updated_by) : null;

    const device = await prisma.device.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true } },
        currentUser: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    return device;
  },

  /**
   * 根据 ID 查询设备（含关联数据）
   */
  async findById(id: number) {
    const device = await prisma.device.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        owner: { select: { id: true, name: true } },
        currentUser: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        phoneNumbers: {
          where: { status: { not: '已注销' } },
          include: {
            internetAccounts: {
              where: { status: { not: '已注销' } },
              select: { id: true, accountCode: true, platform: true, accountName: true, status: true, riskLevel: true },
            },
          },
        },
      },
    });
    return device;
  },

  /**
   * 设备列表（分页/搜索/筛选）
   */
  async findMany(params: DeviceQueryInput): Promise<PaginatedResult<any>> {
    const where: any = { deletedAt: null };

    if (params.search) {
      where.OR = [
        { deviceName: { contains: params.search, mode: 'insensitive' } },
        { deviceCode: { contains: params.search, mode: 'insensitive' } },
        { brandModel: { contains: params.search, mode: 'insensitive' } },
        { imei: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.status) where.status = params.status;
    if (params.risk_level) where.riskLevel = params.risk_level;
    if (params.department_id) where.departmentId = BigInt(params.department_id);
    if (params.owner_user_id) where.ownerUserId = BigInt(params.owner_user_id);
    if (params.sim_type) where.simType = params.sim_type;

    const { skip, take, orderBy } = buildFindManyParams(params, where);
    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          owner: { select: { id: true, name: true } },
          currentUser: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          _count: { select: { phoneNumbers: true } },
        },
      }),
      prisma.device.count({ where }),
    ]);

    return wrapPaginatedResult(devices, total, params.page || 1, params.pageSize || 50);
  },

  /**
   * 软删除设备
   */
  async softDelete(id: number) {
    const device = await prisma.device.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
        status: '已注销',
      },
    });
    return device;
  },

  /**
   * 获取设备 KPI 统计
   */
  async getStats() {
    const [total, active, idle, highRisk, noOwner] = await Promise.all([
      prisma.device.count({ where: { deletedAt: null } }),
      prisma.device.count({ where: { deletedAt: null, status: '启用中' } }),
      prisma.device.count({ where: { deletedAt: null, status: '闲置' } }),
      prisma.device.count({ where: { deletedAt: null, riskLevel: 'high' } }),
      prisma.device.count({ where: { deletedAt: null, ownerUserId: null } }),
    ]);

    return { total, active, idle, highRisk, noOwner };
  },
};
