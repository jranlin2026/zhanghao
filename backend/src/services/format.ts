export function maskPhoneNumber(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  if (value.length < 7) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
}

export function maskLoginAccount(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  if (value.length <= 4) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, 2)}${'*'.repeat(Math.min(15, Math.max(4, value.length - 4)))}${value.slice(-2)}`;
}

export function normalizeDecimal(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}
