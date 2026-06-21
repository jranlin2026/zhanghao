import { PrismaClient } from '@prisma/client';
import { generateAccountCode } from '../utils/codegen';
import { buildFindManyParams, wrapPaginatedResult, type PaginationInput, type PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

/** 互联网账号创建输入 */
interface CreateAccountInput {
  phone_number_id: number;
  platform: string;
  account_name: string;
  login_account: string;
  bind_phone?: string | null;
  bind_email?: string | null;
  owner_subject?: string;
  purpose?: string | null;
  service_provider?: string | null;
  monthly_fee?: number;
  expire_at?: string | null;
  department_id?: number | null;
  owner_user_id?: number | null;
  current_user_id?: number | null;
  permission_status?: string;
  status?: string;
  risk_level?: string;
  remark?: string | null;
  created_by?: number | null;
}

/** 互联网账号更新输入 */
type UpdateAccountInput = Partial<CreateAccountInput> & { updated_by?: number | null };

/** 互联网账号查询参数 */
interface AccountQueryInput extends PaginationInput {
  search?: string;
  phone_number_id?: number;
  platform?: string;
  status?: string;
  risk_level?: string;
  permission_status?: string;
  department_id?: number;
  owner_user_id?: number;
  current_user_id?: number;
}

/**
 * 互联网账号 CRUD 服务
 */
export const accountService = {
  /**
   * 创建互联网账号
   * 自动生成 account_code
   */
  async create(data: CreateAccountInput) {
    const account = await prisma.internetAccount.create({
      data: {
        phoneNumberId: BigInt(data.phone_number_id),
        accountCode: generateAccountCode(),
        platform: data.platform,
        accountName: data.account_name,
        loginAccount: data.login_account,
        bindPhone: data.bind_phone || null,
        bindEmail: data.bind_email || null,
        ownerSubject: data.owner_subject || '公司',
        purpose: data.purpose || null,
        serviceProvider: data.service_provider || null,
        monthlyFee: data.monthly_fee ?? 0,
        expireAt: data.expire_at ? new Date(data.expire_at) : null,
        departmentId: data.department_id ? BigInt(data.department_id) : null,
        ownerUserId: data.owner_user_id ? BigInt(data.owner_user_id) : null,
        currentUserId: data.current_user_id ? BigInt(data.current_user_id) : null,
        permissionStatus: data.permission_status || '已授权',
        status: data.status || '启用中',
        riskLevel: data.risk_level || 'none',
        remark: data.remark || null,
        createdBy: data.created_by ? BigInt(data.created_by) : null,
      },
      include: {
        owner: { select: { id: true, name: true } },
        currentUser: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        phoneNumber: { select: { id: true, phoneNumber: true, deviceId: true } },
      },
    });
    return account;
  },

  /**
   * 更新互联网账号
   */
  async update(id: number, data: UpdateAccountInput) {
    const updateData: any = {};
    if (data.phone_number_id !== undefined) updateData.phoneNumberId = BigInt(data.phone_number_id);
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.account_name !== undefined) updateData.accountName = data.account_name;
    if (data.login_account !== undefined) updateData.loginAccount = data.login_account;
    if (data.bind_phone !== undefined) updateData.bindPhone = data.bind_phone;
    if (data.bind_email !== undefined) updateData.bindEmail = data.bind_email;
    if (data.owner_subject !== undefined) updateData.ownerSubject = data.owner_subject;
    if (data.purpose !== undefined) updateData.purpose = data.purpose;
    if (data.service_provider !== undefined) updateData.serviceProvider = data.service_provider;
    if (data.monthly_fee !== undefined) updateData.monthlyFee = data.monthly_fee;
    if (data.expire_at !== undefined) updateData.expireAt = data.expire_at ? new Date(data.expire_at) : null;
    if (data.department_id !== undefined) updateData.departmentId = data.department_id ? BigInt(data.department_id) : null;
    if (data.owner_user_id !== undefined) updateData.ownerUserId = data.owner_user_id ? BigInt(data.owner_user_id) : null;
    if (data.current_user_id !== undefined) updateData.currentUserId = data.current_user_id ? BigInt(data.current_user_id) : null;
    if (data.permission_status !== undefined) updateData.permissionStatus = data.permission_status;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.risk_level !== undefined) updateData.riskLevel = data.risk_level;
    if (data.remark !== undefined) updateData.remark = data.remark;
    if (data.updated_by !== undefined) updateData.updatedBy = data.updated_by ? BigInt(data.updated_by) : null;

    const account = await prisma.internetAccount.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true } },
        currentUser: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        phoneNumber: { select: { id: true, phoneNumber: true, deviceId: true } },
      },
    });
    return account;
  },

  /**
   * 根据 ID 查询账号
   */
  async findById(id: number) {
    const account = await prisma.internetAccount.findFirst({
      where: { id: BigInt(id) },
      include: {
        owner: { select: { id: true, name: true } },
        currentUser: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        phoneNumber: {
          select: { id: true, phoneNumber: true, slotType: true, device: { select: { id: true, deviceName: true } } },
        },
        sensitiveInfo: {
          select: { id: true, loginPasswordEncrypted: true, realNameInfoEncrypted: true, passwordUpdatedAt: true },
        },
      },
    });
    return account;
  },

  /**
   * 账号列表（分页/搜索/筛选）
   */
  async findMany(params: AccountQueryInput): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (params.search) {
      where.OR = [
        { accountCode: { contains: params.search, mode: 'insensitive' } },
        { accountName: { contains: params.search, mode: 'insensitive' } },
        { loginAccount: { contains: params.search, mode: 'insensitive' } },
        { platform: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.phone_number_id) where.phoneNumberId = BigInt(params.phone_number_id);
    if (params.platform) where.platform = params.platform;
    if (params.status) where.status = params.status;
    if (params.risk_level) where.riskLevel = params.risk_level;
    if (params.permission_status) where.permissionStatus = params.permission_status;
    if (params.department_id) where.departmentId = BigInt(params.department_id);
    if (params.owner_user_id) where.ownerUserId = BigInt(params.owner_user_id);
    if (params.current_user_id) where.currentUserId = BigInt(params.current_user_id);

    const { skip, take, orderBy } = buildFindManyParams(params, where);
    const [accounts, total] = await Promise.all([
      prisma.internetAccount.findMany({
        skip,
        take,
        orderBy,
        where,
        include: {
        owner: { select: { id: true, name: true } },
        currentUser: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        phoneNumber: { select: { id: true, phoneNumber: true } },
        },
      }),
      prisma.internetAccount.count({ where }),
    ]);

    return wrapPaginatedResult(accounts, total, params.page || 1, params.pageSize || 50);
  },

  /**
   * 软删除账号
   */
  async softDelete(id: number) {
    const account = await prisma.internetAccount.update({
      where: { id: BigInt(id) },
      data: { status: '已注销' },
    });
    return account;
  },

  /**
   * 批量操作
   */
  async batchOperation(ids: number[], action: string, value?: string | number) {
    const bigintIds = ids.map((id) => BigInt(id));

    switch (action) {
      case 'change_owner':
        return prisma.internetAccount.updateMany({
          where: { id: { in: bigintIds } },
          data: { ownerUserId: value ? BigInt(Number(value)) : null },
        });
      case 'revoke_permission':
        return prisma.internetAccount.updateMany({
          where: { id: { in: bigintIds } },
          data: { permissionStatus: '已收回' },
        });
      case 'mark_high_risk':
        return prisma.internetAccount.updateMany({
          where: { id: { in: bigintIds } },
          data: { riskLevel: 'high' },
        });
      default:
        throw new Error(`不支持的操作类型: ${action}`);
    }
  },
};
