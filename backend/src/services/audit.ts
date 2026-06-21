const sensitiveKeys = new Set(['phone_number', 'login_account']);

export function sanitizeAuditData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditData(item)) as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitiveKeys.has(key) ? '[masked]' : sanitizeAuditData(item),
      ]),
    ) as T;
  }

  return value;
}

export function toAuditJson(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(sanitizeAuditData(value)));
}
