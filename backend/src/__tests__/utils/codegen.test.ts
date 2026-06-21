/**
 * codegen.test.ts
 * 测试编号生成器
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateDeviceCode, generateAccountCode } from '../../utils/codegen';

describe('generateDeviceCode', () => {
  beforeEach(() => {
    // 固定日期以便测试
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应生成以 DEV- 开头的编号', () => {
    const code = generateDeviceCode();
    expect(code.startsWith('DEV-')).toBe(true);
  });

  it('应包含当前日期（yyyyMMdd）', () => {
    const code = generateDeviceCode();
    // 2025年6月1日 → 20250601
    expect(code).toContain('20250601');
  });

  it('格式应为 DEV-yyyyMMdd-xxxxx', () => {
    const code = generateDeviceCode();
    const pattern = /^DEV-\d{8}-\d{5}$/;
    expect(code).toMatch(pattern);
  });

  it('序列号部分应在 00001-99999 范围内', () => {
    const code = generateDeviceCode();
    const seqStr = code.split('-')[2];
    const seq = parseInt(seqStr, 10);
    expect(seq).toBeGreaterThanOrEqual(1);
    expect(seq).toBeLessThanOrEqual(99999);
  });

  it('每次调用应生成不同的编号（高概率）', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateDeviceCode());
    }
    // 100 次调用应生成 100 个不同的编号
    expect(codes.size).toBe(100);
  });
});

describe('generateAccountCode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应生成以 ACC- 开头的编号', () => {
    const code = generateAccountCode();
    expect(code.startsWith('ACC-')).toBe(true);
  });

  it('格式应为 ACC-yyyyMMdd-xxxxx', () => {
    const code = generateAccountCode();
    const pattern = /^ACC-\d{8}-\d{5}$/;
    expect(code).toMatch(pattern);
  });

  it('应包含当前日期', () => {
    const code = generateAccountCode();
    expect(code).toContain('20250601');
  });
});

describe('编号生成器比较', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('DEVICE 和 ACCOUNT 编号前缀应不同', () => {
    const deviceCode = generateDeviceCode();
    const accountCode = generateAccountCode();

    expect(deviceCode.startsWith('DEV-')).toBe(true);
    expect(accountCode.startsWith('ACC-')).toBe(true);
    expect(deviceCode).not.toBe(accountCode);
  });

  it('同一天生成的编号应使用相同日期部分', () => {
    const deviceCode = generateDeviceCode();
    const accountCode = generateAccountCode();

    const datePart1 = deviceCode.split('-')[1];
    const datePart2 = accountCode.split('-')[1];
    expect(datePart1).toBe('20250601');
    expect(datePart2).toBe('20250601');
  });
});
