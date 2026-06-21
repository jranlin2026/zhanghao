import { describe, expect, it } from 'vitest';
import { maskLoginAccount, maskPhoneNumber } from '../services/format';

describe('masking', () => {
  it('masks phone numbers while keeping search-friendly shape', () => {
    expect(maskPhoneNumber('13912345678')).toBe('139****5678');
    expect(maskPhoneNumber('12345')).toBe('*****');
  });

  it('masks login accounts without exposing full identifiers', () => {
    expect(maskLoginAccount('marketing@example.com')).toBe('ma***************om');
    expect(maskLoginAccount('wx01')).toBe('****');
  });
});
