import dotenv from 'dotenv';
import path from 'path';

// 加载 .env 文件
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * 环境变量配置
 * 所有配置项集中读取，提供默认值
 */
export const env = {
  /** 数据库连接字符串 */
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/account_asset?schema=public',

  /** JWT 密钥 */
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',

  /** 服务器端口 */
  PORT: parseInt(process.env.PORT || '3001', 10),

  /** AES-256-GCM 加密密钥（32字节 hex） */
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',

  /** 前端地址（CORS） */
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  /** 是否为开发环境 */
  isDev: process.env.NODE_ENV !== 'production',
};
