import { prisma } from '../config/db';
import { AuthUser, canReadEntity, requireWritable } from './access';
import { maskLoginAccount, maskPhoneNumber, normalizeDecimal } from './format';
import { getAccountRiskLevel, getDeviceRiskLevel, getPhoneRiskLevel } from './risk';

type Query = Record<string, unknown>;

function pageParams(query: Query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  return { page, pageSize };
}

function containsKeyword(values: Array<unknown>, search: string): boolean {
  const haystack = values.filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(search.toLowerCase());
}

function paginate<T>(items: T[], query: Query) {
  const { page, pageSize } = pageParams(query);
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    pagination: { page, pageSize, total: items.length },
  };
}

function userAccess(user: Express.Request['user']): AuthUser | undefined {
  return user ? { id: user.id, roles: user.roles, departmentId: user.departmentId } : undefined;
}

async function writeLog(user: Express.Request['user'], action: string, targetType: string, targetId: number | null, after?: unknown) {
  await prisma.operationLog.create({
    data: {
      operator_id: user?.id ?? null,
      action_type: action,
      target_type: targetType,
      target_id: targetId,
      after_data: after === undefined ? undefined : JSON.parse(JSON.stringify(after)),
    },
  });
}

function deviceInclude() {
  return {
    department: true,
    owner: true,
    current_user: true,
    phone_numbers: {
      where: { deleted_at: null },
      include: {
        owner: true,
        internet_accounts: { where: { deleted_at: null }, include: { owner: true, current_user: true, department: true } },
      },
      orderBy: { id: 'asc' as const },
    },
  };
}

function phoneInclude() {
  return {
    owner: true,
    device: { include: { department: true, owner: true, current_user: true } },
    internet_accounts: { where: { deleted_at: null }, include: { owner: true, current_user: true, department: true } },
  };
}

function accountInclude() {
  return {
    owner: true,
    current_user: true,
    department: true,
    phone_number: { include: { device: { include: { department: true, owner: true, current_user: true } } } },
  };
}

function serializeDevice(device: any) {
  return {
    ...device,
    department_name: device.department?.name ?? null,
    owner_name: device.owner?.name ?? null,
    current_user_name: device.current_user?.name ?? null,
    phone_numbers: device.phone_numbers?.map(serializePhone) ?? [],
  };
}

function serializePhone(phone: any) {
  return {
    ...phone,
    phone_number_masked: maskPhoneNumber(phone.phone_number),
    monthly_fee: normalizeDecimal(phone.monthly_fee),
    owner_name: phone.owner?.name ?? null,
    device_name: phone.device?.device_name ?? null,
    device_code: phone.device?.device_code ?? null,
    department_id: phone.device?.department_id ?? null,
    department_name: phone.device?.department?.name ?? null,
    internet_accounts: phone.internet_accounts?.map(serializeAccount) ?? [],
  };
}

function serializeAccount(account: any) {
  const phone = account.phone_number;
  const device = phone?.device;
  return {
    ...account,
    login_account_masked: maskLoginAccount(account.login_account),
    bind_phone_masked: maskPhoneNumber(phone?.phone_number),
    monthly_fee: normalizeDecimal(account.monthly_fee),
    owner_name: account.owner?.name ?? null,
    current_user_name: account.current_user?.name ?? null,
    department_name: account.department?.name ?? device?.department?.name ?? null,
    phone_number: phone ? serializePhone({ ...phone, internet_accounts: [] }) : null,
    device_name: device?.device_name ?? null,
    device_code: device?.device_code ?? null,
  };
}

function deviceAccessShape(device: any) {
  return { ownerUserId: device.owner_user_id, currentUserId: device.current_user_id, departmentId: device.department_id };
}

function phoneAccessShape(phone: any) {
  return {
    ownerUserId: phone.owner_user_id,
    currentUserId: phone.device?.current_user_id ?? null,
    departmentId: phone.device?.department_id ?? null,
  };
}

function accountAccessShape(account: any) {
  return {
    ownerUserId: account.owner_user_id,
    currentUserId: account.current_user_id,
    departmentId: account.department_id ?? account.phone_number?.device?.department_id ?? null,
  };
}

export const assetsService = {
  async stats(user: Express.Request['user']) {
    const accessUser = userAccess(user);
    const [devices, phones, accounts] = await Promise.all([
      prisma.device.findMany({ where: { deleted_at: null } }),
      prisma.phoneNumber.findMany({ where: { deleted_at: null }, include: { device: true } }),
      prisma.internetAccount.findMany({ where: { deleted_at: null }, include: { phone_number: { include: { device: true } } } }),
    ]);
    const visibleDevices = devices.filter((device) => canReadEntity(accessUser, deviceAccessShape(device)));
    const visiblePhones = phones.filter((phone) => canReadEntity(accessUser, phoneAccessShape(phone)));
    const visibleAccounts = accounts.filter((account) => canReadEntity(accessUser, accountAccessShape(account)));
    return {
      devices: visibleDevices.length,
      phones: visiblePhones.length,
      accounts: visibleAccounts.length,
      highRisk: [...visibleDevices, ...visiblePhones, ...visibleAccounts].filter((item) => item.risk_level === 'high').length,
      noOwner: [...visibleDevices, ...visiblePhones, ...visibleAccounts].filter((item) => !item.owner_user_id).length,
    };
  },

  async listDevices(user: Express.Request['user'], query: Query) {
    const rows = await prisma.device.findMany({ where: { deleted_at: null }, include: deviceInclude(), orderBy: { updated_at: 'desc' } });
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const filtered = rows
      .filter((device) => canReadEntity(userAccess(user), deviceAccessShape(device)))
      .filter((device) => !search || containsKeyword([device.device_code, device.device_name, device.brand_model, device.imei], search));
    return paginate(filtered.map(serializeDevice), query);
  },

  async getDevice(user: Express.Request['user'], id: number) {
    const device = await prisma.device.findFirst({ where: { id, deleted_at: null }, include: deviceInclude() });
    if (!device || !canReadEntity(userAccess(user), deviceAccessShape(device))) return null;
    return serializeDevice(device);
  },

  async createDevice(user: Express.Request['user'], data: any) {
    requireWritable(userAccess(user));
    const created = await prisma.device.create({
      data: {
        device_code: `DEV-${Date.now()}`,
        device_name: data.device_name,
        brand_model: data.brand_model,
        imei: data.imei,
        sim_type: data.sim_type ?? 'single',
        owner_subject: data.owner_subject ?? '公司',
        department_id: data.department_id ? Number(data.department_id) : null,
        owner_user_id: data.owner_user_id ? Number(data.owner_user_id) : null,
        current_user_id: data.current_user_id ? Number(data.current_user_id) : null,
        status: data.status ?? '使用中',
        remark: data.remark ?? null,
      },
      include: deviceInclude(),
    });
    const risk_level = getDeviceRiskLevel(created);
    const updated = await prisma.device.update({ where: { id: created.id }, data: { risk_level }, include: deviceInclude() });
    await writeLog(user, 'create', 'device', updated.id, updated);
    return serializeDevice(updated);
  },

  async updateDevice(user: Express.Request['user'], id: number, data: any) {
    requireWritable(userAccess(user));
    const updated = await prisma.device.update({
      where: { id },
      data: {
        device_name: data.device_name,
        brand_model: data.brand_model,
        imei: data.imei,
        sim_type: data.sim_type,
        owner_subject: data.owner_subject,
        department_id: data.department_id === undefined ? undefined : Number(data.department_id) || null,
        owner_user_id: data.owner_user_id === undefined ? undefined : Number(data.owner_user_id) || null,
        current_user_id: data.current_user_id === undefined ? undefined : Number(data.current_user_id) || null,
        status: data.status,
        remark: data.remark,
      },
      include: deviceInclude(),
    });
    const risk_level = getDeviceRiskLevel(updated);
    const withRisk = await prisma.device.update({ where: { id }, data: { risk_level }, include: deviceInclude() });
    await writeLog(user, 'update', 'device', id, withRisk);
    return serializeDevice(withRisk);
  },

  async deleteDevice(user: Express.Request['user'], id: number) {
    requireWritable(userAccess(user));
    const deleted = await prisma.device.update({ where: { id }, data: { status: '已注销', deleted_at: new Date() } });
    await writeLog(user, 'delete', 'device', id, deleted);
    return deleted;
  },

  async listPhones(user: Express.Request['user'], query: Query) {
    const rows = await prisma.phoneNumber.findMany({ where: { deleted_at: null }, include: phoneInclude(), orderBy: { updated_at: 'desc' } });
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const filtered = rows
      .filter((phone) => canReadEntity(userAccess(user), phoneAccessShape(phone)))
      .filter((phone) => !search || containsKeyword([phone.phone_number, phone.carrier, phone.device.device_name], search));
    return paginate(filtered.map(serializePhone), query);
  },

  async getPhone(user: Express.Request['user'], id: number) {
    const phone = await prisma.phoneNumber.findFirst({ where: { id, deleted_at: null }, include: phoneInclude() });
    if (!phone || !canReadEntity(userAccess(user), phoneAccessShape(phone))) return null;
    return serializePhone(phone);
  },

  async createPhone(user: Express.Request['user'], data: any) {
    requireWritable(userAccess(user));
    const created = await prisma.phoneNumber.create({
      data: {
        device_id: Number(data.device_id),
        slot_type: data.slot_type ?? 'sim1',
        phone_number: data.phone_number,
        carrier: data.carrier,
        is_primary: Boolean(data.is_primary),
        monthly_fee: data.monthly_fee === undefined ? null : Number(data.monthly_fee),
        plan_type: data.plan_type ?? null,
        owner_user_id: data.owner_user_id ? Number(data.owner_user_id) : null,
        status: data.status ?? '使用中',
        remark: data.remark ?? null,
      },
      include: phoneInclude(),
    });
    const risk_level = getPhoneRiskLevel(created);
    const updated = await prisma.phoneNumber.update({ where: { id: created.id }, data: { risk_level }, include: phoneInclude() });
    await writeLog(user, 'create', 'phone_number', updated.id, updated);
    return serializePhone(updated);
  },

  async updatePhone(user: Express.Request['user'], id: number, data: any) {
    requireWritable(userAccess(user));
    const updated = await prisma.phoneNumber.update({
      where: { id },
      data: {
        slot_type: data.slot_type,
        phone_number: data.phone_number,
        carrier: data.carrier,
        is_primary: data.is_primary,
        monthly_fee: data.monthly_fee === undefined ? undefined : Number(data.monthly_fee),
        plan_type: data.plan_type,
        owner_user_id: data.owner_user_id === undefined ? undefined : Number(data.owner_user_id) || null,
        status: data.status,
        remark: data.remark,
      },
      include: phoneInclude(),
    });
    const risk_level = getPhoneRiskLevel(updated);
    const withRisk = await prisma.phoneNumber.update({ where: { id }, data: { risk_level }, include: phoneInclude() });
    await writeLog(user, 'update', 'phone_number', id, withRisk);
    return serializePhone(withRisk);
  },

  async deletePhone(user: Express.Request['user'], id: number) {
    requireWritable(userAccess(user));
    const deleted = await prisma.phoneNumber.update({ where: { id }, data: { status: '已注销', deleted_at: new Date() } });
    await writeLog(user, 'delete', 'phone_number', id, deleted);
    return deleted;
  },

  async listAccounts(user: Express.Request['user'], query: Query) {
    const rows = await prisma.internetAccount.findMany({ where: { deleted_at: null }, include: accountInclude(), orderBy: { updated_at: 'desc' } });
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const filtered = rows
      .filter((account) => canReadEntity(userAccess(user), accountAccessShape(account)))
      .filter((account) => !search || containsKeyword([account.account_code, account.account_name, account.platform, account.login_account], search));
    return paginate(filtered.map(serializeAccount), query);
  },

  async getAccount(user: Express.Request['user'], id: number) {
    const account = await prisma.internetAccount.findFirst({ where: { id, deleted_at: null }, include: accountInclude() });
    if (!account || !canReadEntity(userAccess(user), accountAccessShape(account))) return null;
    return serializeAccount(account);
  },

  async createAccount(user: Express.Request['user'], data: any) {
    requireWritable(userAccess(user));
    const created = await prisma.internetAccount.create({
      data: {
        phone_number_id: Number(data.phone_number_id),
        account_code: `ACC-${Date.now()}`,
        platform: data.platform,
        account_name: data.account_name,
        login_account: data.login_account,
        bind_email: data.bind_email ?? null,
        owner_subject: data.owner_subject ?? '公司',
        purpose: data.purpose ?? null,
        service_provider: data.service_provider ?? null,
        monthly_fee: data.monthly_fee === undefined ? null : Number(data.monthly_fee),
        expire_at: data.expire_at ? new Date(data.expire_at) : null,
        department_id: data.department_id ? Number(data.department_id) : null,
        owner_user_id: data.owner_user_id ? Number(data.owner_user_id) : null,
        current_user_id: data.current_user_id ? Number(data.current_user_id) : null,
        permission_status: data.permission_status ?? '正常',
        status: data.status ?? '使用中',
        remark: data.remark ?? null,
      },
      include: accountInclude(),
    });
    const risk_level = getAccountRiskLevel(created);
    const updated = await prisma.internetAccount.update({ where: { id: created.id }, data: { risk_level }, include: accountInclude() });
    await writeLog(user, 'create', 'internet_account', updated.id, updated);
    return serializeAccount(updated);
  },

  async updateAccount(user: Express.Request['user'], id: number, data: any) {
    requireWritable(userAccess(user));
    const updated = await prisma.internetAccount.update({
      where: { id },
      data: {
        platform: data.platform,
        account_name: data.account_name,
        login_account: data.login_account,
        bind_email: data.bind_email,
        owner_subject: data.owner_subject,
        purpose: data.purpose,
        service_provider: data.service_provider,
        monthly_fee: data.monthly_fee === undefined ? undefined : Number(data.monthly_fee),
        expire_at: data.expire_at === undefined ? undefined : data.expire_at ? new Date(data.expire_at) : null,
        department_id: data.department_id === undefined ? undefined : Number(data.department_id) || null,
        owner_user_id: data.owner_user_id === undefined ? undefined : Number(data.owner_user_id) || null,
        current_user_id: data.current_user_id === undefined ? undefined : Number(data.current_user_id) || null,
        permission_status: data.permission_status,
        status: data.status,
        remark: data.remark,
      },
      include: accountInclude(),
    });
    const risk_level = getAccountRiskLevel(updated);
    const withRisk = await prisma.internetAccount.update({ where: { id }, data: { risk_level }, include: accountInclude() });
    await writeLog(user, 'update', 'internet_account', id, withRisk);
    return serializeAccount(withRisk);
  },

  async deleteAccount(user: Express.Request['user'], id: number) {
    requireWritable(userAccess(user));
    const deleted = await prisma.internetAccount.update({ where: { id }, data: { status: '已注销', deleted_at: new Date() } });
    await writeLog(user, 'delete', 'internet_account', id, deleted);
    return deleted;
  },

  async logs(user: Express.Request['user'], query: Query) {
    const rows = await prisma.operationLog.findMany({ include: { operator: true }, orderBy: { created_at: 'desc' } });
    return paginate(
      rows.map((log) => ({
        ...log,
        operator_name: log.operator?.name ?? null,
      })),
      query,
    );
  },
};
