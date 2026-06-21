import bcrypt from 'bcryptjs';
import { signToken } from '../config/jwt';
import { AuthUser, canReadAll, canReadEntity, requireWritable } from './access';
import { maskLoginAccount, maskPhoneNumber, normalizeDecimal } from './format';

type Query = Record<string, unknown>;
type DemoUser = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  password_hash: string;
  role: string;
  department_id: number | null;
  status: string;
  created_at: Date;
  updated_at: Date;
};
type DemoDepartment = { id: number; name: string; manager_user_id: number | null; created_at: Date; updated_at: Date };
type DemoDevice = {
  id: number;
  device_code: string;
  device_name: string;
  brand_model: string;
  imei: string;
  sim_type: string;
  owner_subject: string;
  department_id: number | null;
  owner_user_id: number | null;
  current_user_id: number | null;
  status: string;
  risk_level: string;
  remark: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};
type DemoPhone = {
  id: number;
  device_id: number;
  slot_type: string;
  phone_number: string;
  carrier: string;
  is_primary: boolean;
  monthly_fee: number | null;
  plan_type: string | null;
  owner_user_id: number | null;
  status: string;
  risk_level: string;
  remark: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};
type DemoAccount = {
  id: number;
  phone_number_id: number;
  account_code: string;
  platform: string;
  account_name: string;
  login_account: string;
  bind_email: string | null;
  owner_subject: string;
  purpose: string | null;
  service_provider: string | null;
  monthly_fee: number | null;
  expire_at: Date | null;
  department_id: number | null;
  owner_user_id: number | null;
  current_user_id: number | null;
  permission_status: string;
  status: string;
  risk_level: string;
  remark: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};
type DemoLog = {
  id: number;
  operator_id: number | null;
  action_type: string;
  target_type: string;
  target_id: number | null;
  before_data: unknown | null;
  after_data: unknown | null;
  created_at: Date;
};

const now = new Date();
const passwordHash = bcrypt.hashSync('123456', 10);

const departments: DemoDepartment[] = [
  { id: 1, name: '运营部', manager_user_id: 2, created_at: now, updated_at: now },
  { id: 2, name: '财务部', manager_user_id: null, created_at: now, updated_at: now },
];

const users: DemoUser[] = [
  { id: 1, name: 'admin', email: 'admin@example.com', phone: '13800000001', password_hash: passwordHash, role: 'admin', department_id: 1, status: 'active', created_at: now, updated_at: now },
  { id: 2, name: 'boss', email: 'boss@example.com', phone: '13800000002', password_hash: passwordHash, role: 'boss', department_id: null, status: 'active', created_at: now, updated_at: now },
  { id: 3, name: 'employee', email: 'employee@example.com', phone: '13800000003', password_hash: passwordHash, role: 'employee', department_id: 1, status: 'active', created_at: now, updated_at: now },
];

const devices: DemoDevice[] = [
  { id: 1, device_code: 'DEV-202606-001', device_name: '运营主机 01', brand_model: 'iPhone 15', imei: '860000000000001', sim_type: 'dual', owner_subject: '公司', department_id: 1, owner_user_id: 3, current_user_id: 3, status: '使用中', risk_level: 'none', remark: '本地演示数据', deleted_at: null, created_at: now, updated_at: now },
  { id: 2, device_code: 'DEV-202606-002', device_name: '财务备用机', brand_model: 'Xiaomi 14', imei: '860000000000002', sim_type: 'single', owner_subject: '公司', department_id: 2, owner_user_id: null, current_user_id: null, status: '闲置', risk_level: 'medium', remark: null, deleted_at: null, created_at: now, updated_at: now },
];

const phones: DemoPhone[] = [
  { id: 1, device_id: 1, slot_type: 'SIM1', phone_number: '13812345678', carrier: '中国移动', is_primary: true, monthly_fee: 59, plan_type: '商务套餐', owner_user_id: 3, status: '使用中', risk_level: 'none', remark: null, deleted_at: null, created_at: now, updated_at: now },
  { id: 2, device_id: 2, slot_type: 'SIM1', phone_number: '13987654321', carrier: '中国联通', is_primary: true, monthly_fee: 39, plan_type: '基础套餐', owner_user_id: null, status: '使用中', risk_level: 'medium', remark: null, deleted_at: null, created_at: now, updated_at: now },
];

const accounts: DemoAccount[] = [
  { id: 1, phone_number_id: 1, account_code: 'ACC-202606-001', platform: '微信', account_name: '公司服务号', login_account: 'service@example.com', bind_email: 'service@example.com', owner_subject: '公司', purpose: '客户运营', service_provider: '腾讯', monthly_fee: null, expire_at: null, department_id: 1, owner_user_id: 3, current_user_id: 3, permission_status: '正常', status: '使用中', risk_level: 'none', remark: null, deleted_at: null, created_at: now, updated_at: now },
  { id: 2, phone_number_id: 2, account_code: 'ACC-202606-002', platform: '抖音', account_name: '品牌备用号', login_account: 'brand-demo', bind_email: null, owner_subject: '公司', purpose: '内容发布', service_provider: '字节', monthly_fee: null, expire_at: null, department_id: 1, owner_user_id: null, current_user_id: null, permission_status: '需复核', status: '使用中', risk_level: 'high', remark: null, deleted_at: null, created_at: now, updated_at: now },
];

const logs: DemoLog[] = [];

function userAccess(user: Express.Request['user']): AuthUser | undefined {
  return user ? { id: user.id, roles: user.roles, departmentId: user.departmentId } : undefined;
}

function publicUser(user: DemoUser) {
  const department = departments.find((item) => item.id === user.department_id);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    roles: [user.role],
    department_id: user.department_id,
    department_name: department?.name ?? null,
    status: user.status,
  };
}

function adminUser(user: DemoUser) {
  return {
    ...publicUser(user),
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function deviceShape(device: DemoDevice) {
  return { ownerUserId: device.owner_user_id, currentUserId: device.current_user_id, departmentId: device.department_id };
}

function phoneShape(phone: DemoPhone) {
  const device = devices.find((item) => item.id === phone.device_id);
  return { ownerUserId: phone.owner_user_id, currentUserId: device?.current_user_id ?? null, departmentId: device?.department_id ?? null };
}

function accountShape(account: DemoAccount) {
  return { ownerUserId: account.owner_user_id, currentUserId: account.current_user_id, departmentId: account.department_id };
}

function serializeDevice(device: DemoDevice) {
  const department = departments.find((item) => item.id === device.department_id);
  const owner = users.find((item) => item.id === device.owner_user_id);
  const current = users.find((item) => item.id === device.current_user_id);
  return {
    ...device,
    department_name: department?.name ?? null,
    owner_name: owner?.name ?? null,
    current_user_name: current?.name ?? null,
    phone_numbers: phones.filter((phone) => phone.device_id === device.id && !phone.deleted_at).map(serializePhone),
  };
}

function serializePhone(phone: DemoPhone): any {
  const device = devices.find((item) => item.id === phone.device_id);
  const owner = users.find((item) => item.id === phone.owner_user_id);
  const department = departments.find((item) => item.id === device?.department_id);
  return {
    ...phone,
    phone_number_masked: maskPhoneNumber(phone.phone_number),
    monthly_fee: normalizeDecimal(phone.monthly_fee),
    owner_name: owner?.name ?? null,
    device_name: device?.device_name ?? null,
    device_code: device?.device_code ?? null,
    department_id: device?.department_id ?? null,
    department_name: department?.name ?? null,
    internet_accounts: accounts.filter((account) => account.phone_number_id === phone.id && !account.deleted_at).map(serializeAccount),
  };
}

function serializeAccount(account: DemoAccount): any {
  const phone = phones.find((item) => item.id === account.phone_number_id);
  const device = phone ? devices.find((item) => item.id === phone.device_id) : undefined;
  const department = departments.find((item) => item.id === (account.department_id ?? device?.department_id));
  const owner = users.find((item) => item.id === account.owner_user_id);
  const current = users.find((item) => item.id === account.current_user_id);
  const phoneOwner = users.find((item) => item.id === phone?.owner_user_id);
  return {
    ...account,
    login_account_masked: maskLoginAccount(account.login_account),
    bind_phone_masked: maskPhoneNumber(phone?.phone_number),
    monthly_fee: normalizeDecimal(account.monthly_fee),
    owner_name: owner?.name ?? null,
    current_user_name: current?.name ?? null,
    department_name: department?.name ?? null,
    phone_number: phone
      ? {
          ...phone,
          phone_number_masked: maskPhoneNumber(phone.phone_number),
          monthly_fee: normalizeDecimal(phone.monthly_fee),
          owner_name: phoneOwner?.name ?? null,
          device_name: device?.device_name ?? null,
          device_code: device?.device_code ?? null,
          department_id: device?.department_id ?? null,
          department_name: departments.find((item) => item.id === device?.department_id)?.name ?? null,
          internet_accounts: [],
        }
      : null,
    device_name: device?.device_name ?? null,
    device_code: device?.device_code ?? null,
  };
}

function matchesSearch(values: unknown[], search: string) {
  return values.filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase());
}

function matchesFilters(item: { status?: string; risk_level?: string }, query: Query) {
  const status = typeof query.status === 'string' ? query.status : '';
  const riskLevel = typeof query.riskLevel === 'string' ? query.riskLevel : '';
  return (!status || item.status === status) && (!riskLevel || item.risk_level === riskLevel);
}

function paginate<T>(items: T[], query: Query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  return { data: items.slice((page - 1) * pageSize, page * pageSize), pagination: { page, pageSize, total: items.length } };
}

function notFound(): never {
  const error = new Error('记录不存在') as Error & { statusCode?: number };
  error.statusCode = 404;
  throw error;
}

function writeLog(user: Express.Request['user'], action: string, targetType: string, targetId: number | null, before: unknown, after: unknown) {
  logs.unshift({ id: logs.length + 1, operator_id: user?.id ?? null, action_type: action, target_type: targetType, target_id: targetId, before_data: before ?? null, after_data: after ?? null, created_at: new Date() });
}

export const demoStore = {
  async login(name: string, password: string) {
    const user = users.find((item) => item.name === name && item.status === 'active');
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      const error = new Error('用户名或密码错误') as Error & { statusCode?: number };
      error.statusCode = 401;
      throw error;
    }
    return {
      token: signToken({ userId: user.id, name: user.name, roles: [user.role], departmentId: user.department_id }),
      user: publicUser(user),
    };
  },

  async getProfile(userId: number) {
    const user = users.find((item) => item.id === userId && item.status === 'active');
    if (!user) notFound();
    return publicUser(user);
  },

  async meta(user: Express.Request['user']) {
    const accessUser = userAccess(user);
    return {
      departments: departments.map((item) => ({ id: item.id, name: item.name })),
      users: users.filter((item) => item.status === 'active').map((item) => ({ id: item.id, name: item.name, role: item.role, department_id: item.department_id })),
      devices: devices.filter((item) => !item.deleted_at && canReadEntity(accessUser, deviceShape(item))).map((item) => ({ id: item.id, name: item.device_name, code: item.device_code })),
      phones: phones.filter((item) => !item.deleted_at && canReadEntity(accessUser, phoneShape(item))).map((item) => ({ id: item.id, name: `${maskPhoneNumber(item.phone_number)} / ${devices.find((device) => device.id === item.device_id)?.device_name ?? ''}` })),
    };
  },

  async stats(user: Express.Request['user']) {
    const accessUser = userAccess(user);
    const visibleDevices = devices.filter((item) => !item.deleted_at && canReadEntity(accessUser, deviceShape(item)));
    const visiblePhones = phones.filter((item) => !item.deleted_at && canReadEntity(accessUser, phoneShape(item)));
    const visibleAccounts = accounts.filter((item) => !item.deleted_at && canReadEntity(accessUser, accountShape(item)));
    return {
      devices: visibleDevices.length,
      phones: visiblePhones.length,
      accounts: visibleAccounts.length,
      highRisk: [...visibleDevices, ...visiblePhones, ...visibleAccounts].filter((item) => item.risk_level === 'high').length,
      noOwner: [...visibleDevices, ...visiblePhones, ...visibleAccounts].filter((item) => !item.owner_user_id).length,
    };
  },

  async listDevices(user: Express.Request['user'], query: Query) {
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    return paginate(devices.filter((item) => !item.deleted_at && canReadEntity(userAccess(user), deviceShape(item)) && matchesFilters(item, query) && (!search || matchesSearch([item.device_code, item.device_name, item.brand_model, item.imei], search))).map(serializeDevice), query);
  },

  async getDevice(user: Express.Request['user'], id: number) {
    const device = devices.find((item) => item.id === id && !item.deleted_at);
    return device && canReadEntity(userAccess(user), deviceShape(device)) ? serializeDevice(device) : null;
  },

  async createDevice(user: Express.Request['user'], data: any) {
    requireWritable(userAccess(user));
    const created: DemoDevice = { id: devices.length + 1, device_code: `DEV-DEMO-${devices.length + 1}`, device_name: data.device_name, brand_model: data.brand_model, imei: data.imei, sim_type: data.sim_type ?? 'single', owner_subject: data.owner_subject ?? '公司', department_id: Number(data.department_id) || null, owner_user_id: Number(data.owner_user_id) || null, current_user_id: Number(data.current_user_id) || null, status: data.status ?? '使用中', risk_level: data.owner_user_id ? 'none' : 'medium', remark: data.remark ?? null, deleted_at: null, created_at: new Date(), updated_at: new Date() };
    devices.unshift(created);
    writeLog(user, 'create', 'device', created.id, null, created);
    return serializeDevice(created);
  },

  async updateDevice(user: Express.Request['user'], id: number, data: any) {
    requireWritable(userAccess(user));
    const device = devices.find((item) => item.id === id && !item.deleted_at);
    if (!device) notFound();
    const before = { ...device };
    Object.assign(device, data, { updated_at: new Date() });
    writeLog(user, 'update', 'device', id, before, device);
    return serializeDevice(device);
  },

  async deleteDevice(user: Express.Request['user'], id: number) {
    requireWritable(userAccess(user));
    const device = devices.find((item) => item.id === id && !item.deleted_at);
    if (!device) notFound();
    device.status = '已注销';
    device.deleted_at = new Date();
    writeLog(user, 'delete', 'device', id, null, device);
    return device;
  },

  async listPhones(user: Express.Request['user'], query: Query) {
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    return paginate(phones.filter((item) => !item.deleted_at && canReadEntity(userAccess(user), phoneShape(item)) && matchesFilters(item, query) && (!search || matchesSearch([item.phone_number, item.carrier, devices.find((device) => device.id === item.device_id)?.device_name], search))).map(serializePhone), query);
  },

  async getPhone(user: Express.Request['user'], id: number) {
    const phone = phones.find((item) => item.id === id && !item.deleted_at);
    return phone && canReadEntity(userAccess(user), phoneShape(phone)) ? serializePhone(phone) : null;
  },

  async createPhone(user: Express.Request['user'], data: any) {
    requireWritable(userAccess(user));
    const created: DemoPhone = { id: phones.length + 1, device_id: Number(data.device_id), slot_type: data.slot_type ?? 'SIM1', phone_number: data.phone_number, carrier: data.carrier, is_primary: Boolean(data.is_primary), monthly_fee: Number(data.monthly_fee) || null, plan_type: data.plan_type ?? null, owner_user_id: Number(data.owner_user_id) || null, status: data.status ?? '使用中', risk_level: data.owner_user_id ? 'none' : 'medium', remark: data.remark ?? null, deleted_at: null, created_at: new Date(), updated_at: new Date() };
    phones.unshift(created);
    writeLog(user, 'create', 'phone_number', created.id, null, created);
    return serializePhone(created);
  },

  async updatePhone(user: Express.Request['user'], id: number, data: any) {
    requireWritable(userAccess(user));
    const phone = phones.find((item) => item.id === id && !item.deleted_at);
    if (!phone) notFound();
    const before = { ...phone };
    Object.assign(phone, data, { updated_at: new Date() });
    writeLog(user, 'update', 'phone_number', id, before, phone);
    return serializePhone(phone);
  },

  async deletePhone(user: Express.Request['user'], id: number) {
    requireWritable(userAccess(user));
    const phone = phones.find((item) => item.id === id && !item.deleted_at);
    if (!phone) notFound();
    phone.status = '已注销';
    phone.deleted_at = new Date();
    writeLog(user, 'delete', 'phone_number', id, null, phone);
    return phone;
  },

  async listAccounts(user: Express.Request['user'], query: Query) {
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    return paginate(accounts.filter((item) => !item.deleted_at && canReadEntity(userAccess(user), accountShape(item)) && matchesFilters(item, query) && (!search || matchesSearch([item.account_code, item.account_name, item.platform, item.login_account], search))).map(serializeAccount), query);
  },

  async getAccount(user: Express.Request['user'], id: number) {
    const account = accounts.find((item) => item.id === id && !item.deleted_at);
    return account && canReadEntity(userAccess(user), accountShape(account)) ? serializeAccount(account) : null;
  },

  async createAccount(user: Express.Request['user'], data: any) {
    requireWritable(userAccess(user));
    const created: DemoAccount = { id: accounts.length + 1, phone_number_id: Number(data.phone_number_id), account_code: `ACC-DEMO-${accounts.length + 1}`, platform: data.platform, account_name: data.account_name, login_account: data.login_account, bind_email: data.bind_email ?? null, owner_subject: data.owner_subject ?? '公司', purpose: data.purpose ?? null, service_provider: data.service_provider ?? null, monthly_fee: Number(data.monthly_fee) || null, expire_at: data.expire_at ? new Date(data.expire_at) : null, department_id: Number(data.department_id) || null, owner_user_id: Number(data.owner_user_id) || null, current_user_id: Number(data.current_user_id) || null, permission_status: data.permission_status ?? '正常', status: data.status ?? '使用中', risk_level: data.owner_user_id ? 'none' : 'high', remark: data.remark ?? null, deleted_at: null, created_at: new Date(), updated_at: new Date() };
    accounts.unshift(created);
    writeLog(user, 'create', 'internet_account', created.id, null, created);
    return serializeAccount(created);
  },

  async updateAccount(user: Express.Request['user'], id: number, data: any) {
    requireWritable(userAccess(user));
    const account = accounts.find((item) => item.id === id && !item.deleted_at);
    if (!account) notFound();
    const before = { ...account };
    Object.assign(account, data, { updated_at: new Date() });
    writeLog(user, 'update', 'internet_account', id, before, account);
    return serializeAccount(account);
  },

  async deleteAccount(user: Express.Request['user'], id: number) {
    requireWritable(userAccess(user));
    const account = accounts.find((item) => item.id === id && !item.deleted_at);
    if (!account) notFound();
    account.status = '已注销';
    account.deleted_at = new Date();
    writeLog(user, 'delete', 'internet_account', id, null, account);
    return account;
  },

  async logs(user: Express.Request['user'], query: Query) {
    const accessUser = userAccess(user);
    const rows = canReadAll(accessUser) ? logs : logs.filter((item) => item.operator_id === user?.id);
    return paginate(rows.map((log) => ({ ...log, operator_name: users.find((item) => item.id === log.operator_id)?.name ?? null })), query);
  },

  async risks(user: Express.Request['user'], query: Query) {
    const accessUser = userAccess(user);
    const rows = [
      ...devices.filter((item) => !item.deleted_at && item.risk_level !== 'none' && canReadEntity(accessUser, deviceShape(item))).map((item) => ({ id: `device-${item.id}`, entity_type: 'device', entity_id: item.id, entity_name: item.device_name, risk_level: item.risk_level, risk_title: '设备需要关注', risk_reason: '缺少负责人或绑定关系不完整', suggestion: '补充负责人并复核绑定关系', detected_at: item.updated_at })),
      ...phones.filter((item) => !item.deleted_at && item.risk_level !== 'none' && canReadEntity(accessUser, phoneShape(item))).map((item) => ({ id: `phone-${item.id}`, entity_type: 'phone_number', entity_id: item.id, entity_name: maskPhoneNumber(item.phone_number), risk_level: item.risk_level, risk_title: '手机号需要关注', risk_reason: '缺少负责人或账号绑定', suggestion: '补充负责人并绑定互联网账号', detected_at: item.updated_at })),
      ...accounts.filter((item) => !item.deleted_at && item.risk_level !== 'none' && canReadEntity(accessUser, accountShape(item))).map((item) => ({ id: `account-${item.id}`, entity_type: 'internet_account', entity_id: item.id, entity_name: item.account_name, risk_level: item.risk_level, risk_title: '账号高风险', risk_reason: '缺少负责人或权限状态异常', suggestion: '补充负责人并复核权限状态', detected_at: item.updated_at })),
    ];
    return paginate(rows, query);
  },

  async listUsers(user: Express.Request['user']) {
    return canReadAll(userAccess(user)) ? users.map(adminUser) : [];
  },

  async createUser(user: Express.Request['user'], data: any) {
    requireWritable(userAccess(user));
    const created: DemoUser = { id: users.length + 1, name: data.name, email: data.email ?? null, phone: data.phone ?? null, password_hash: bcrypt.hashSync(data.password || '123456', 10), role: data.role ?? 'employee', department_id: Number(data.department_id) || null, status: data.status ?? 'active', created_at: new Date(), updated_at: new Date() };
    users.push(created);
    writeLog(user, 'create', 'user', created.id, null, publicUser(created));
    return adminUser(created);
  },

  async updateUser(user: Express.Request['user'], id: number, data: any) {
    requireWritable(userAccess(user));
    const target = users.find((item) => item.id === id);
    if (!target) notFound();
    const before = publicUser(target);
    Object.assign(target, data, { department_id: data.department_id === undefined ? target.department_id : Number(data.department_id) || null, updated_at: new Date() });
    if (data.password) target.password_hash = bcrypt.hashSync(data.password, 10);
    writeLog(user, 'update', 'user', id, before, publicUser(target));
    return adminUser(target);
  },

  async listDepartments() {
    return departments.map((item) => ({ ...item, user_count: users.filter((user) => user.department_id === item.id).length }));
  },

  async createDepartment(user: Express.Request['user'], data: any) {
    requireWritable(userAccess(user));
    const created: DemoDepartment = { id: departments.length + 1, name: data.name, manager_user_id: Number(data.manager_user_id) || null, created_at: new Date(), updated_at: new Date() };
    departments.push(created);
    writeLog(user, 'create', 'department', created.id, null, created);
    return { ...created, user_count: 0 };
  },

  async updateDepartment(user: Express.Request['user'], id: number, data: any) {
    requireWritable(userAccess(user));
    const target = departments.find((item) => item.id === id);
    if (!target) notFound();
    const before = { ...target };
    Object.assign(target, data, { manager_user_id: data.manager_user_id === undefined ? target.manager_user_id : Number(data.manager_user_id) || null, updated_at: new Date() });
    writeLog(user, 'update', 'department', id, before, target);
    return { ...target, user_count: users.filter((item) => item.department_id === id).length };
  },
};
