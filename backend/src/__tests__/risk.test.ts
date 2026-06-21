import { describe, expect, it } from 'vitest';
import { getDeviceRiskLevel, getPhoneRiskLevel, getAccountRiskLevel } from '../services/risk';

describe('risk rules', () => {
  it('marks assets without owners as high risk', () => {
    expect(getDeviceRiskLevel({ owner_user_id: null, status: '使用中', phone_numbers: [{}] })).toBe('high');
    expect(getPhoneRiskLevel({ owner_user_id: null, status: '使用中', internet_accounts: [{}] })).toBe('high');
    expect(getAccountRiskLevel({ owner_user_id: null, status: '使用中', permission_status: '正常' })).toBe('high');
  });

  it('marks missing child bindings as lower risks', () => {
    expect(getDeviceRiskLevel({ owner_user_id: 1, status: '使用中', phone_numbers: [] })).toBe('medium');
    expect(getPhoneRiskLevel({ owner_user_id: 1, status: '使用中', internet_accounts: [] })).toBe('low');
  });
});
