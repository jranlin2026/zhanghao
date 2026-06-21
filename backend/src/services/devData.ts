import { signToken } from '../config/jwt';

type LocalUser = {
  id: number;
  name: string;
  password: string;
  email: string;
  phone: string;
  department_id: number;
  department_name: string;
  status: 'active' | 'disabled';
  roles: string[];
};

type LocalDevice = {
  id: number;
  device_code: string;
  device_name: string;
  brand_model: string;
  imei: string;
  sim_type: 'single' | 'dual';
  owner_subject: string;
  department_id: number;
  department_name: string;
  owner_user_id: number | null;
  owner_name: string | null;
  current_user_id: number | null;
  current_user_name: string | null;
  status: '使用中' | '闲置';
  risk_level: 'none' | 'low' | 'medium' | 'high';
  remark: string | null;
  created_at: string;
  updated_at: string;
  phone_numbers: Array<{
    id: number;
    slot_type: 'sim1' | 'sim2';
    phone_number: string;
    carrier: string;
    internet_accounts: Array<{ id: number; platform: string; account_name: string }>;
  }>;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

const localUsers: LocalUser[] = [
  {
    id: 1,
    name: 'admin',
    password: 'admin123',
    email: 'admin@company.com',
    phone: '13800000001',
    department_id: 1,
    department_name: '管理部',
    status: 'active',
    roles: ['super_admin', 'account_admin'],
  },
];

const localDevices: LocalDevice[] = [
  {
    id: 1,
    device_code: 'DEV-20260601-00001',
    device_name: '王伟工作机',
    brand_model: 'iPhone 14 Pro',
    imei: '356789012345671',
    sim_type: 'dual',
    owner_subject: '公司',
    department_id: 1,
    department_name: '运营部',
    owner_user_id: 1,
    owner_name: '管理员',
    current_user_id: 1,
    current_user_name: '王伟',
    status: '使用中',
    risk_level: 'none',
    remark: null,
    created_at: new Date('2026-06-01T09:00:00+08:00').toISOString(),
    updated_at: new Date('2026-06-21T10:00:00+08:00').toISOString(),
    phone_numbers: [
      {
        id: 1,
        slot_type: 'sim1',
        phone_number: '13912345678',
        carrier: '中国移动',
        internet_accounts: [
          { id: 1, platform: '微信', account_name: '公司服务号' },
          { id: 2, platform: '抖音', account_name: '极享商业中台' },
        ],
      },
    ],
  },
  {
    id: 2,
    device_code: 'DEV-20260601-00002',
    device_name: '直播专用机',
    brand_model: 'Xiaomi 13',
    imei: '867890123456782',
    sim_type: 'single',
    owner_subject: '公司',
    department_id: 2,
    department_name: '直播部',
    owner_user_id: null,
    owner_name: null,
    current_user_id: null,
    current_user_name: null,
    status: '闲置',
    risk_level: 'high',
    remark: '缺少负责人，待盘点',
    created_at: new Date('2026-06-01T11:00:00+08:00').toISOString(),
    updated_at: new Date('2026-06-20T15:30:00+08:00').toISOString(),
    phone_numbers: [
      {
        id: 2,
        slot_type: 'sim1',
        phone_number: '17711223344',
        carrier: '中国电信',
        internet_accounts: [],
      },
    ],
  },
];

function toPublicUser(user: LocalUser) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function authenticateLocalUser(name: string, password: string) {
  const user = localUsers.find((item) => item.name === name && item.status === 'active');
  if (!user) {
    throw new Error('用户不存在');
  }
  if (user.password !== password) {
    throw new Error('密码错误');
  }

  return {
    token: signToken({ userId: user.id, name: user.name, roles: user.roles }),
    user: toPublicUser(user),
  };
}

export function getLocalUserProfile(userId: number) {
  const user = localUsers.find((item) => item.id === userId);
  if (!user) {
    throw new Error('用户不存在');
  }
  return toPublicUser(user);
}

export function listLocalDevices(params: { page?: unknown; pageSize?: unknown; search?: unknown } = {}): {
  data: LocalDevice[];
  pagination: Pagination;
} {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 50));
  const keyword = typeof params.search === 'string' ? params.search.trim().toLowerCase() : '';
  const filtered = keyword
    ? localDevices.filter((device) => {
        const haystack = [device.device_code, device.device_name, device.brand_model, device.imei].join(' ').toLowerCase();
        return haystack.includes(keyword);
      })
    : localDevices;

  const start = (page - 1) * pageSize;
  return {
    data: filtered.slice(start, start + pageSize),
    pagination: { page, pageSize, total: filtered.length },
  };
}

export function getLocalDeviceById(id: number) {
  return localDevices.find((device) => device.id === id) ?? null;
}

export function getLocalDeviceStats() {
  return {
    total: localDevices.length,
    active: localDevices.filter((device) => device.status === '使用中').length,
    idle: localDevices.filter((device) => device.status === '闲置').length,
    highRisk: localDevices.filter((device) => device.risk_level === 'high').length,
    noOwner: localDevices.filter((device) => !device.owner_user_id).length,
  };
}
