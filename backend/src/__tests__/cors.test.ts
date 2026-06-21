import { describe, expect, it } from 'vitest';
import { isAllowedCorsOrigin, parseAllowedOrigins } from '../config/cors';

describe('cors origin configuration', () => {
  it('parses comma separated frontend origins', () => {
    expect(parseAllowedOrigins('https://a.example.com/, https://b.example.com ,,')).toEqual([
      'https://a.example.com',
      'https://b.example.com',
    ]);
  });

  it('allows configured production origins', () => {
    expect(isAllowedCorsOrigin('https://b.example.com', 'https://a.example.com,https://b.example.com', false)).toBe(true);
  });

  it('allows localhost origins in development', () => {
    expect(isAllowedCorsOrigin('http://127.0.0.1:5197', 'https://asset.example.com', true)).toBe(true);
  });
});
