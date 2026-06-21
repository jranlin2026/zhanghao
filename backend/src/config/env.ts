import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export type RuntimeEnv = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  PORT: number;
  FRONTEND_URL: string;
  DEV_DEMO_MODE: boolean;
  isDev: boolean;
};

export function validateRuntimeEnv(runtimeEnv: RuntimeEnv): RuntimeEnv {
  if (!Number.isInteger(runtimeEnv.PORT) || runtimeEnv.PORT < 1 || runtimeEnv.PORT > 65535) {
    throw new Error('PORT must be a valid port number');
  }

  if (!runtimeEnv.isDev && runtimeEnv.JWT_SECRET === 'default-jwt-secret-change-in-production') {
    throw new Error('JWT_SECRET must be changed in production');
  }

  if (!runtimeEnv.isDev && runtimeEnv.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  return runtimeEnv;
}

export const env = validateRuntimeEnv({
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/account_asset?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
  PORT: Number.parseInt(process.env.PORT || '3001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DEV_DEMO_MODE: process.env.DEV_DEMO_MODE === 'true',
  isDev: process.env.NODE_ENV !== 'production',
});
