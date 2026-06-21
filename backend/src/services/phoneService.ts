import { PrismaClient } from '@prisma/client';
import { buildFindManyParams, wrapPaginatedResult, type PaginationInput, type PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

/** 手机号创建输入 */
interface CreatePhoneInput {
  device_id: number;
  slot_type: string;
  phone_number: string;
  carrier: string;
  is_primary?: boolean;
  monthly_fee?: number;
  plan_type?: string | null;
  owner_user_id?: number | null;
  status?: string;
  remark?: string | null;
}

/** 手机号更新输入 */
type UpdatePhoneInput = Partial<CreatePhoneInput>;

/** 手机号查询参数 */
interface PhoneQueryInput extends PaginationInput {
  search?: string;
  device_id?: number;
  status?: string;
  carrier?: string;
  slot_type?: string;
  owner_user_id?: number;
}

/**
 * 手机号 CRUD 服务
 */
export const phoneService = {
  /**
   * 创建手机号
   */
  async create(data: CreatePhoneInput) {
    const phone = await prisma.phoneNumber.create({
      data: {
        deviceId: BigInt(data.device_id),
        slotType: data.slot_type,
        phoneNumber: data.phone_number,
        carrier: data.carrier,
        isPrimary: data.is_primary ?? false,
        monthlyFee: data.monthly_fee ?? 0,
        planType: data.plan_type || null,
        ownerUserId: data.owner_user_id ? BigInt(data.owner_user_id) : null,
        status: data.status || '启用中',
        remark: data.remark || null,
      },
      include: {
        device: { select: { id: true, deviceName: true } },
        owner: { select: { id: true, name: true } },
      },
    });
    return phone;
  },

  /**
   * 更新手机号
   */
  async update(id: number, data: UpdatePhoneInput) {
    const updateData: any = {};
    if (data.slot_type !== undefined) updateData.slotType = data.slot_type;
    if (data.phone_number !== undefined) updateData.phoneNumber = data.phone_number;
    if (data.carrier !== undefined) updateData.carrier = data.carrier;
    if (data.is_primary !== undefined) updateData.isPrimary = data.is_primary;
    if (data.monthly_fee !== undefined) updateData.monthlyFee = data.monthly_fee;
    if (data.plan_type !== undefined) updateData.planType = data.plan_type;
    if (data.owner_user_id !== undefined) updateData.ownerUserId = data.owner_user_id ? BigInt(data.owner_user_id) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.remark !== undefined) updateData.remark = data.remark;

    const phone = await prisma.phoneNumber.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        device: { select: { id: true, deviceName: true } },
        owner: { select: { id: true, name: true } },
      },
    });
    return phone;
  },

  /**
   * 根据 ID 查询手机号（含关联账号）
   */
  async findById(id: number) {
    const phone = await prisma.phoneNumber.findFirst({
      where: { id: BigInt(id) },
      include: {
        device: { select: { id: true, deviceName: true, brandModel: true } },
        owner: { select: { id: true, name: true } },
        internetAccounts: {
          where: { status: { not: '已注销' } },
          include: {
            owner: { select: { id: true, name: true } },
          },
        },
      },
    });
    return phone;
  },

  /**
   * 手机号列表（分页/搜索/筛选）
   */
  async findMany(params: PhoneQueryInput): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (params.search) {
      where.OR = [
        { phoneNumber: { contains: params.search } },
        { carrier: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.device_id) where.deviceId = BigInt(params.device_id);
    if (params.status) where.status = params.status;
    if (params.carrier) where.carrier = params.carrier;
    if (params.slot_type) where.slotType = params.slot_type;
    if (params.owner_user_id) where.ownerUserId = BigInt(params.owner_user_id);

    const { skip, take, orderBy } = buildFindManyParams(params, where);
    const [phones, total] = await Promise.all([
      prisma.phoneNumber.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
          device: { select: { id: true, deviceName: true } },
          owner: { select: { id: true, name: true } },
          _count: { select: { internetAccounts: true } },
        },
      }),
      prisma.phoneNumber.count({ where }),
    ]);

    return wrapPaginatedResult(phones, total, params.page || 1, params.pageSize || 50);
  },

  /**
   * 根据设备 ID 查询手机号
   */
  async findByDeviceId(deviceId: number) {
    const phones = await prisma.phoneNumber.findMany({
      where: { deviceId: BigInt(deviceId), status: { not: '已注销' } },
      include: {
        device: { select: { id: true, deviceName: true } },
        owner: { select: { id: true, name: true } },
        _count: { select: { internetAccounts: true } },
      },
      orderBy: { slotType: 'asc' },
    });
    return phones;
  },

  /**
   * 软删除手机号
   */
  async softDelete(id: number) {
    const phone = await prisma.phoneNumber.update({
      where: { id: BigInt(id) },
      data: { status: '已注销' },
    });
    return phone;
  },
};
