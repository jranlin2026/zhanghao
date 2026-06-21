import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { encrypt } from '../config/crypto';
import { riskEngine } from './riskEngine';

const prisma = new PrismaClient();

/** 导入统计 */
interface ImportSummary {
  total: number;
  devices_created: number;
  phones_created: number;
  accounts_created: number;
  errors: string[];
}

/** 预览数据行 */
interface PreviewRow {
  rowIndex: number;
  data: Record<string, string>;
  valid: boolean;
  error?: string;
}

/** 导入视图类型 */
type ImportViewType = 'device' | 'phone' | 'account';

/** 各视图必填列定义 */
const REQUIRED_COLUMNS: Record<ImportViewType, string[]> = {
  device: ['device_name', 'brand_model', 'imei', 'sim_type'],
  phone: ['phone_number', 'carrier', 'slot_type', 'device_code'],
  account: ['platform', 'account_name', 'login_account', 'phone_number'],
};

/** 各视图字段描述 */
const COLUMN_LABELS: Record<string, string> = {
  device_name: '设备名称',
  brand_model: '品牌型号',
  imei: 'IMEI',
  sim_type: 'SIM类型',
  owner_subject: '所属主体',
  phone_number: '手机号',
  carrier: '运营商',
  slot_type: '卡槽类型',
  device_code: '设备编号',
  platform: '平台',
  account_name: '账号名称',
  login_account: '登录账号',
  monthly_fee: '月费用',
  bind_phone: '绑定手机号',
  bind_email: '绑定邮箱',
  purpose: '用途说明',
  plan_type: '套餐说明',
};

/**
 * 导入服务
 * 支持 3 种视图模板：设备 / 手机号 / 互联网账号
 */
export const importService = {

  /**
   * 解析上传文件，返回预览数据
   * @param fileBuffer 文件数据
   * @param viewType 视图类型
   */
  async importPreview(fileBuffer: Buffer, viewType: ImportViewType): Promise<{
    columns: string[];
    rows: PreviewRow[];
    required: string[];
    totalRows: number;
  }> {
    // 解析 Excel/CSV
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('文件中没有找到工作表');
    }
    const sheet = workbook.Sheets[sheetName];
    const rawData: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawData.length === 0) {
      throw new Error('文件中没有数据');
    }

    const required = REQUIRED_COLUMNS[viewType];
    const columns = Object.keys(rawData[0]);

    // 校验行数据
    const rows: PreviewRow[] = rawData.map((row, index) => {
      const missingFields = required.filter((col) => !row[col] || String(row[col]).trim() === '');
      const errors: string[] = [];

      if (missingFields.length > 0) {
        errors.push(`缺少必填列: ${missingFields.map((f) => COLUMN_LABELS[f] || f).join('、')}`);
      }

      // 数据类型校验
      if (viewType === 'device' && row.sim_type && !['single', 'dual'].includes(row.sim_type)) {
        errors.push('SIM类型只能为 single 或 dual');
      }
      if (viewType === 'phone' && row.slot_type && !['sim1', 'sim2'].includes(row.slot_type)) {
        errors.push('卡槽类型只能为 sim1 或 sim2');
      }
      if (row.monthly_fee && isNaN(Number(row.monthly_fee))) {
        errors.push('月费用必须为数字');
      }

      return {
        rowIndex: index + 2, // Excel 行号（含表头）
        data: row,
        valid: errors.length === 0,
        error: errors.length > 0 ? errors.join('; ') : undefined,
      };
    });

    return {
      columns,
      rows,
      required,
      totalRows: rawData.length,
    };
  },

  /**
   * 确认导入
   * 开启事务，按设备→手机号→账号顺序导入
   * 关联规则：device_code → phone_number → 原文关联
   */
  async importConfirm(fileBuffer: Buffer, viewType: ImportViewType, operatorId: number): Promise<ImportSummary> {
    const summary: ImportSummary = {
      total: 0,
      devices_created: 0,
      phones_created: 0,
      accounts_created: 0,
      errors: [],
    };

    // 解析文件
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawData.length === 0) {
      throw new Error('文件中没有数据');
    }

    // 使用事务
    await prisma.$transaction(async (tx) => {
      for (const row of rawData) {
        try {
          summary.total++;

          if (viewType === 'device') {
            await this._importDevice(tx, row, operatorId);
            summary.devices_created++;
          } else if (viewType === 'phone') {
            await this._importPhone(tx, row, operatorId);
            summary.phones_created++;
          } else if (viewType === 'account') {
            await this._importAccount(tx, row, operatorId);
            summary.accounts_created++;
          }
        } catch (e: any) {
          summary.errors.push(`行 ${summary.total + 1}: ${e.message}`);
        }
      }
    });

    // 触发风险扫描
    try {
      await riskEngine.runFullScan();
    } catch (e) {
      console.error('[ImportService] 风险扫描失败:', e);
    }

    return summary;
  },

  /**
   * 导入设备
   */
  async _importDevice(tx: any, row: Record<string, string>, operatorId: number) {
    // 检查 IMEI 是否已存在
    const existingDevice = await tx.device.findUnique({
      where: { imei: row.imei },
    });
    if (existingDevice) {
      throw new Error(`设备 IMEI ${row.imei} 已存在`);
    }

    await tx.device.create({
      data: {
        deviceCode: `DEV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')}`,
        deviceName: row.device_name,
        brandModel: row.brand_model,
        imei: row.imei,
        simType: row.sim_type || 'single',
        ownerSubject: row.owner_subject || '公司',
        status: '启用中',
        riskLevel: 'none',
        createdBy: BigInt(operatorId),
      },
    });
  },

  /**
   * 导入手机号（通过 device_code 关联设备）
   */
  async _importPhone(tx: any, row: Record<string, string>, operatorId: number) {
    // 通过 device_code 查找设备
    const device = await tx.device.findUnique({
      where: { deviceCode: row.device_code },
    });
    if (!device) {
      throw new Error(`设备编号 ${row.device_code} 不存在，请先导入设备`);
    }

    // 检查手机号是否已存在
    const existingPhone = await tx.phoneNumber.findUnique({
      where: { phoneNumber: row.phone_number },
    });
    if (existingPhone) {
      throw new Error(`手机号 ${row.phone_number} 已存在`);
    }

    await tx.phoneNumber.create({
      data: {
        deviceId: device.id,
        slotType: row.slot_type || 'sim1',
        phoneNumber: row.phone_number,
        carrier: row.carrier,
        isPrimary: row.slot_type === 'sim1' || false,
        monthlyFee: row.monthly_fee ? Number(row.monthly_fee) : 0,
        planType: row.plan_type || null,
        status: '启用中',
      },
    });
  },

  /**
   * 导入互联网账号（通过 phone_number 关联手机号）
   */
  async _importAccount(tx: any, row: Record<string, string>, operatorId: number) {
    // 通过 phone_number 查找手机号
    const phone = await tx.phoneNumber.findUnique({
      where: { phoneNumber: row.phone_number },
    });
    if (!phone) {
      throw new Error(`手机号 ${row.phone_number} 不存在，请先导入手机号`);
    }

    const accountCode = `ACC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')}`;

    const account = await tx.internetAccount.create({
      data: {
        phoneNumberId: phone.id,
        accountCode,
        platform: row.platform,
        accountName: row.account_name,
        loginAccount: row.login_account,
        bindPhone: row.bind_phone || null,
        bindEmail: row.bind_email || null,
        ownerSubject: row.owner_subject || '公司',
        purpose: row.purpose || null,
        monthlyFee: row.monthly_fee ? Number(row.monthly_fee) : 0,
        status: '启用中',
        riskLevel: 'none',
        permissionStatus: '已授权',
        createdBy: BigInt(operatorId),
      },
    });

    // 如果有密码列，同步创建敏感信息
    if (row.login_password) {
      await tx.accountSensitiveInfo.create({
        data: {
          accountId: account.id,
          loginPasswordEncrypted: encrypt(row.login_password),
          passwordUpdatedAt: new Date(),
        },
      });
    }
  },
};
