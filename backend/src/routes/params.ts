export function parseIdParam(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('ID 参数不正确') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }
  return id;
}
