import { describe, expect, it } from 'vitest';
import { parseIdParam } from '../routes/params';

describe('route params', () => {
  it('parses positive integer ids', () => {
    expect(parseIdParam('42')).toBe(42);
  });

  it('rejects invalid ids', () => {
    expect(() => parseIdParam('abc')).toThrow('ID 参数不正确');
    expect(() => parseIdParam('0')).toThrow('ID 参数不正确');
  });
});
