import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

/** 导出视图类型 */
type ExportViewType = 'device' | 'phone' | 'account';

/** 导出过滤条件 */
interface ExportFilters {
  search?: string;
  status?: string;
  risk_level?: string;
  department_id?: number;
  entity_type?: string;
  carrier?: string;
  platform?: string;
}

/**
 * 导出服务
 * 根据视图类型查询实体列表，生成 xlsx 工作簿
 * 敏感信息列仅 super_admin 和 account_admin 可导出
 */
export const exportService = {

  /**
   * 导出数据
   * @param viewType 视图类型
   * @param filters 过滤条件
   * @param user 当前用户（含角色）
   * @returns xlsx 文件 Buffer
   */
  async exportData(viewType: ExportViewType, filters: ExportFilters, user: { id: number; roles: string[] }): Promise<Buffer> {
    const canExportSensitive = user.roles.includes('super_admin') || user.roles.includes('account_admin');

    switch (viewType) {
      case 'device':
        return this._exportDevices(filters);
      case 'phone':
        return this._exportPhones(filters);
      case 'account':
        return this._exportAccounts(filters, canExportSensitive);
      default:
        throw new Error('无效的导出视图类型');
    }
  },

  /**
   * 导出设备
   */
  async _exportDevices(filters: ExportFilters): Promise<Buffer> {
    const where: any = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { deviceName: { contains: filters.search, mode: 'insensitive' } },
        { deviceCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.status) where.status = filters.status;
    if (filters.risk_level) where.riskLevel = filters.risk_level;

    const devices = await prisma.device.findMany({
      where,
      include: {
        owner: { select: { name: true } },
        currentUser: { select: { name: true } },
        department: { select: { name: true } },
        _count: { select: { phoneNumbers: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const header = ['设备编号', '设备名称', '品牌型号', 'IMEI', 'SIM类型', '所属主体', '部门', '负责人', '当前使用人', '状态', '绑定手机号数', '备注'];
    const rows = devices.map((d) => [
      d.deviceCode,
      d.deviceName,
      d.brandModel,
      d.imei,
      d.simType === 'dual' ? '双卡' : '单卡',
      d.ownerSubject,
      d.department?.name || '',
      d.owner?.name || '',
      d.currentUser?.name || '',
      d.status,
      d._count.phoneNumbers,
      d.remark || '',
    ]);

    return this._buildWorkbook(header, rows);
  },

  /**
   * 导出手机号
   */
  async _exportPhones(filters: ExportFilters): Promise<Buffer> {
    const where: any = {};
    if (filters.search) {
      where.OR = [
        { phoneNumber: { contains: filters.search } },
        { carrier: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.status) where.status = filters.status;
    if (filters.carrier) where.carrier = filters.carrier;

    const phones = await prisma.phoneNumber.findMany({
      where,
      include: {
        device: { select: { deviceCode: true, deviceName: true } },
        owner: { select: { name: true } },
        _count: { select: { internetAccounts: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const header = ['手机号', '运营商', '卡槽', '所属设备编号', '所属设备名称', '月费用', '套餐说明', '负责人', '状态', '绑定账号数', '备注'];
    const rows = phones.map((p) => [
      p.phoneNumber,
      p.carrier,
      p.slotType === 'sim1' ? 'SIM卡槽1' : 'SIM卡槽2',
      p.device?.deviceCode || '',
      p.device?.deviceName || '',
      Number(p.monthlyFee),
      p.planType || '',
      p.owner?.name || '',
      p.status,
      p._count.internetAccounts,
      p.remark || '',
    ]);

    return this._buildWorkbook(header, rows);
  },

  /**
   * 导出互联网账号
   * @param canExportSensitive 是否可导出敏感信息
   */
  async _exportAccounts(filters: ExportFilters, canExportSensitive: boolean): Promise<Buffer> {
    const where: any = {};
    if (filters.search) {
      where.OR = [
        { accountName: { contains: filters.search, mode: 'insensitive' } },
        { accountCode: { contains: filters.search, mode: 'insensitive' } },
        { platform: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.status) where.status = filters.status;
    if (filters.risk_level) where.riskLevel = filters.risk_level;
    if (filters.platform) where.platform = filters.platform;

    const accounts = await prisma.internetAccount.findMany({
      where,
      include: {
        owner: { select: { name: true } },
        department: { select: { name: true } },
        phoneNumber: { select: { phoneNumber: true } },
        sensitiveInfo: {
          select: {
            loginPasswordEncrypted: true,
            realNameInfoEncrypted: true,
            backupInfoEncrypted: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const header = canExportSensitive
      ? ['账号编号', '平台', '账号名称', '登录账号', '所属手机号', '所属主体', '部门', '负责人', '状态', '风险等级', '权限状态', '月费用', '到期时间', '登录密码', '实名信息', '备注']
      : ['账号编号', '平台', '账号名称', '登录账号', '所属手机号', '所属主体', '部门', '负责人', '状态', '风险等级', '权限状态', '月费用', '到期时间', '备注'];

    const rows = accounts.map((a) => {
      const base = [
        a.accountCode,
        a.platform,
        a.accountName,
        a.loginAccount,
        a.phoneNumber?.phoneNumber || '',
        a.ownerSubject,
        a.department?.name || '',
        a.owner?.name || '',
        a.status,
        a.riskLevel,
        a.permissionStatus,
        Number(a.monthlyFee),
        a.expireAt ? a.expireAt.toISOString().slice(0, 10) : '',
      ];

      if (canExportSensitive) {
        // 敏感信息导出：解码 base64 或标记
        const { decrypt } = require('../config/crypto');
        let pwd = '';
        let realName = '';
        try {
          if (a.sensitiveInfo?.loginPasswordEncrypted) {
            pwd = decrypt(a.sensitiveInfo.loginPasswordEncrypted);
          }
          if (a.sensitiveInfo?.realNameInfoEncrypted) {
            realName = decrypt(a.sensitiveInfo.realNameInfoEncrypted);
          }
        } catch {
          pwd = '***解密失败***';
          realName = '***解密失败***';
        }
        return [...base, pwd, realName, a.remark || ''];
      }

      return [...base, a.remark || ''];
    });

    return this._buildWorkbook(header, rows);
  },

  /**
   * 构建 xlsx 工作簿 Buffer
   */
  _buildWorkbook(header: string[], rows: any[][]): Buffer {
    const data = [header, ...rows];
    const sheet = XLSX.utils.aoa_to_sheet(data);

    // 设置列宽
    const colWidths = header.map((h) => ({ wch: Math.max(h.length * 2, 12) }));
    sheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  },
};
