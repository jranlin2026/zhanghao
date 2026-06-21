import { describe, expect, it } from 'vitest';
import { sanitizeAuditData } from '../services/audit';

describe('audit sanitization', () => {
  it('removes sensitive plain text from nested log payloads', () => {
    const result = sanitizeAuditData({
      phone_number: '13912345678',
      login_account: 'service@example.com',
      nested: { phone_number: '17711223344', keep: 'ok' },
    });

    expect(result).toEqual({
      phone_number: '[masked]',
      login_account: '[masked]',
      nested: { phone_number: '[masked]', keep: 'ok' },
    });
  });
});
