import type {
  ApiResponse,
  AssetMeta,
  Device,
  InternetAccount,
  ListFilters,
  ListResponse,
  OperationLog,
  PhoneNumber,
  RiskItem,
  Stats,
  User,
  ViewType,
} from '../types/assets';

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

function pathForView(view: ViewType) {
  return view === 'devices' ? '/devices' : view === 'phones' ? '/phone-numbers' : '/internet-accounts';
}

export const api = {
  login(name: string, password: string) {
    return request<ApiResponse<LoginResult>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    });
  },

  profile() {
    return request<ApiResponse<User>>('/auth/profile');
  },

  meta() {
    return request<ApiResponse<AssetMeta>>('/meta');
  },

  stats() {
    return request<ApiResponse<Stats>>('/assets/stats');
  },

  list(view: ViewType, filters: ListFilters) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
    params.set('page', String(filters.page));
    params.set('pageSize', String(filters.pageSize));
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<ListResponse<Device | PhoneNumber | InternetAccount>>(`${pathForView(view)}${query}`);
  },

  logs() {
    return request<ListResponse<OperationLog>>('/operation-logs');
  },

  risks() {
    return request<ListResponse<RiskItem>>('/risks');
  },

  create(view: ViewType, data: Record<string, unknown>) {
    return request<ApiResponse<Device | PhoneNumber | InternetAccount>>(pathForView(view), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(view: ViewType, id: number, data: Record<string, unknown>) {
    return request<ApiResponse<Device | PhoneNumber | InternetAccount>>(`${pathForView(view)}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  remove(view: ViewType, id: number) {
    return request<ApiResponse<boolean>>(`${pathForView(view)}/${id}`, {
      method: 'DELETE',
    });
  },
};
