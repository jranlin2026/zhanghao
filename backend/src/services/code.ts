import { randomUUID } from 'crypto';

export function createAssetCode(prefix: string, date = new Date(), entropy = randomUUID().replace(/-/g, '').slice(0, 8)): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${prefix}-${yyyy}${mm}${dd}-${entropy.toUpperCase()}`;
}
