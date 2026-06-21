import { describe, expect, it } from 'vitest';
import { authenticateLocalUser, listLocalDevices, getLocalDeviceStats } from '../devData';

describe('devData fallback', () => {
  it('authenticates the default administrator account', async () => {
    const result = await authenticateLocalUser('admin', 'admin123');

    expect(result.user.name).toBe('admin');
    expect(result.user.roles).toContain('super_admin');
    expect(result.token).toEqual(expect.any(String));
  });

  it('rejects an invalid local password', async () => {
    await expect(authenticateLocalUser('admin', 'wrong-password')).rejects.toThrow('密码错误');
  });

  it('returns a paginated device list and matching stats', () => {
    const devices = listLocalDevices({ page: 1, pageSize: 10 });
    const stats = getLocalDeviceStats();

    expect(devices.data.length).toBeGreaterThan(0);
    expect(devices.pagination.total).toBe(devices.data.length);
    expect(stats.total).toBe(devices.data.length);
    expect(devices.data[0]).toMatchObject({
      device_code: expect.any(String),
      device_name: expect.any(String),
      phone_numbers: expect.any(Array),
    });
  });
});
