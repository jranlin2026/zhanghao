import { describe, expect, it } from 'vitest';
import { canReadEntity, canWrite } from '../services/access';

describe('access rules', () => {
  it('allows admins to write and read every entity', () => {
    const user = { id: 1, roles: ['admin'], departmentId: 1 };

    expect(canWrite(user)).toBe(true);
    expect(canReadEntity(user, { ownerUserId: 99, currentUserId: 99, departmentId: 9 })).toBe(true);
  });

  it('keeps boss read-only', () => {
    const user = { id: 2, roles: ['boss'], departmentId: 1 };

    expect(canWrite(user)).toBe(false);
    expect(canReadEntity(user, { ownerUserId: null, currentUserId: null, departmentId: 9 })).toBe(true);
  });

  it('limits employees to related assets', () => {
    const user = { id: 3, roles: ['employee'], departmentId: 2 };

    expect(canReadEntity(user, { ownerUserId: 3, currentUserId: null, departmentId: 1 })).toBe(true);
    expect(canReadEntity(user, { ownerUserId: null, currentUserId: 3, departmentId: 1 })).toBe(true);
    expect(canReadEntity(user, { ownerUserId: null, currentUserId: null, departmentId: 2 })).toBe(true);
    expect(canReadEntity(user, { ownerUserId: null, currentUserId: null, departmentId: 1 })).toBe(false);
  });
});
