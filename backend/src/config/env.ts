import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/account_asset?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
  PORT: Number.parseInt(process.env.PORT || '3001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  isDev: process.env.NODE_ENV !== 'production',
};
