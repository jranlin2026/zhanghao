type Payload = Record<string, unknown>;

const roles = new Set(['admin', 'boss', 'employee']);
const statuses = new Set(['active', 'disabled']);

function fail(message: string): never {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 400;
  throw error;
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === '';
}

export function validateUserPayload(payload: Payload, options: { partial?: boolean } = {}): void {
  if (!options.partial || 'name' in payload) {
    if (isBlank(payload.name)) fail('用户名称不能为空');
  }

  if ('role' in payload && !roles.has(String(payload.role))) {
    fail('角色不正确');
  }

  if ('status' in payload && !statuses.has(String(payload.status))) {
    fail('用户状态不正确');
  }

  if ('password' in payload && !isBlank(payload.password) && String(payload.password).length < 6) {
    fail('密码至少 6 位');
  }
}

export function validateDepartmentPayload(payload: Payload): void {
  if (isBlank(payload.name)) {
    fail('部门名称不能为空');
  }
}
