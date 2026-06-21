import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';

/**
 * Axios 实例
 * 基础 URL: http://localhost:3001/api
 * 包含 JWT Token 注入请求拦截器和统一错误响应拦截器
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 不需要 Token 的白名单路径 */
const NO_AUTH_PATHS = ['/auth/login', '/health'];

/**
 * 请求拦截器
 * 从 localStorage 读取 JWT Token 注入到请求头
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 白名单路径不注入 Token
    if (NO_AUTH_PATHS.some((path) => config.url?.includes(path))) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * 统一处理业务错误码和 HTTP 错误
 */
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse;
    // 业务码非 200 时也视为错误
    if (data.code && data.code !== 200) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || '请求失败';

      switch (status) {
        case 401:
          // Token 过期或无效，清除 Token 并跳转登录
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.warn('[API] 权限不足:', message);
          break;
        case 429:
          console.warn('[API] 请求过于频繁');
          break;
        case 500:
          console.error('[API] 服务器错误:', message);
          break;
      }

      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
