export type AuthUser = {
  id: number;
  roles: string[];
  departmentId: number | null;
};

export type EntityAccessShape = {
  ownerUserId: number | null;
  currentUserId: number | null;
  departmentId: number | null;
};

export function hasAnyRole(user: AuthUser | undefined, roles: string[]): boolean {
  return Boolean(user?.roles.some((role) => roles.includes(role)));
}

export function canWrite(user: AuthUser | undefined): boolean {
  return hasAnyRole(user, ['admin']);
}

export function canReadAll(user: AuthUser | undefined): boolean {
  return hasAnyRole(user, ['admin', 'boss']);
}

export function canReadEntity(user: AuthUser | undefined, entity: EntityAccessShape): boolean {
  if (!user) {
    return false;
  }
  if (canReadAll(user)) {
    return true;
  }
  return (
    entity.ownerUserId === user.id ||
    entity.currentUserId === user.id ||
    (user.departmentId !== null && entity.departmentId === user.departmentId)
  );
}

export function requireWritable(user: AuthUser | undefined): void {
  if (!canWrite(user)) {
    const error = new Error('没有写入权限') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }
}
