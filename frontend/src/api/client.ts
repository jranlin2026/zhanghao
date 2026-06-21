import type { ApiResponse, Device, InternetAccount, ListResponse, PhoneNumber, Stats, User, ViewType } from '../types/assets';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

type LoginResult = {
  token: string;
  user: User;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('asset_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || '请求失败');
  }
  return payload;
}

export const api = {
  async login(name: string, password: string) {
    return request<ApiResponse<LoginResult>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    });
  },

  async profile() {
    return request<ApiResponse<User>>('/auth/profile');
  },

  async stats() {
    return request<ApiResponse<Stats>>('/assets/stats');
  },

  async list(view: ViewType, search: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const path = view === 'devices' ? '/devices' : view === 'phones' ? '/phone-numbers' : '/internet-accounts';
    return request<ListResponse<Device | PhoneNumber | InternetAccount>>(`${path}${query}`);
  },

  async create(view: ViewType, data: Record<string, unknown>) {
    const path = view === 'devices' ? '/devices' : view === 'phones' ? '/phone-numbers' : '/internet-accounts';
    return request<ApiResponse<Device | PhoneNumber | InternetAccount>>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(view: ViewType, id: number, data: Record<string, unknown>) {
    const path = view === 'devices' ? '/devices' : view === 'phones' ? '/phone-numbers' : '/internet-accounts';
    return request<ApiResponse<Device | PhoneNumber | InternetAccount>>(`${path}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
