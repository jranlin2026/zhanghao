import { describe, expect, it } from 'vitest';
import { validateRuntimeEnv } from '../config/env';

describe('runtime env validation', () => {
  it('rejects the default JWT secret in production', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/account_asset?schema=public',
        JWT_SECRET: 'default-jwt-secret-change-in-production',
        PORT: 3001,
        FRONTEND_URL: 'https://asset.example.com',
        isDev: false,
      }),
    ).toThrow('JWT_SECRET must be changed in production');
  });

  it('rejects invalid ports', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/account_asset?schema=public',
        JWT_SECRET: 'local-secret',
        PORT: Number.NaN,
        FRONTEND_URL: 'http://localhost:5173',
        isDev: true,
      }),
    ).toThrow('PORT must be a valid port number');
  });
});
