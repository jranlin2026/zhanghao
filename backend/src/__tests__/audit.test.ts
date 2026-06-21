import { describe, expect, it } from 'vitest';
import { sanitizeAuditData, toAuditJson } from '../services/audit';

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

  it('converts sanitized payloads into plain audit JSON', () => {
    const result = toAuditJson({
      phone_number: '13912345678',
      created_at: new Date('2026-06-21T05:00:00.000Z'),
    });

    expect(result).toEqual({
      phone_number: '[masked]',
      created_at: '2026-06-21T05:00:00.000Z',
    });
  });
});
