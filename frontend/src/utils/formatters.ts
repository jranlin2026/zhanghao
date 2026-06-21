/**
 * 格式化工具函数
 * 日期、金额、脱敏等格式化
 */

/**
 * 格式化日期
 * @param dateStr ISO 日期字符串
 * @param format 格式模板，默认 'YYYY-MM-DD HH:mm'
 */
export function formatDate(dateStr: string | null | undefined, format = 'YYYY-MM-DD HH:mm'): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';

  const pad = (n: number) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', min)
    .replace('ss', sec);
}

/**
 * 格式化相对时间（如 "3分钟前"）
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;

  return `${Math.floor(months / 12)}年前`;
}

/**
 * 金额格式化
 * @param value 金额值
 * @param unit 单位，默认 '元'
 */
export function formatMoney(value: number | string | null | undefined, unit = '元'): string {
  if (value === null || value === undefined) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return `${num.toFixed(2)}${unit}`;
}

/**
 * 脱敏手机号
 * 138****1234
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  if (phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/**
 * 脱敏登录账号（邮箱或手机号格式自适应）
 */
export function maskLoginAccount(account: string | null | undefined): string {
  if (!account) return '-';
  if (account.includes('@')) {
    // 邮箱脱敏: a***@domain.com
    const [name, domain] = account.split('@');
    if (name.length <= 1) return `${name}***@${domain}`;
    return `${name[0]}***@${domain}`;
  }
  // 手机号脱敏
  return maskPhone(account);
}

/**
 * 脱敏名称（显示首尾字符）
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return '-';
  if (name.length <= 1) return '*';
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}***${name[name.length - 1]}`;
}

/**
 * 分页信息格式化
 */
export function formatPaginationInfo(page: number, pageSize: number, total: number): string {
  if (total === 0) return '暂无数据';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `第 ${start}-${end} 条，共 ${total} 条`;
}

/**
 * 截断文本
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 将后端 BigInt 转为数字
 */
export function toNumber(value: bigint | number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}
