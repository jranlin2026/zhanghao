import { describe, expect, it } from 'vitest';
import { createAssetCode } from '../services/code';

describe('asset code generation', () => {
  it('builds readable codes with date and entropy', () => {
    const code = createAssetCode('DEV', new Date('2026-06-21T13:59:00.000Z'), 'abc12345');

    expect(code).toBe('DEV-20260621-ABC12345');
  });
});
