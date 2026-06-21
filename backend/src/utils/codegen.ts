/**
 * 编号生成器
 * 生成 device_code (DEV-yyyyMMdd-xxxxx) 和 account_code (ACC-yyyyMMdd-xxxxx)
 */

/**
 * 获取当前日期的 YYYYMMDD 格式字符串
 */
function getDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 生成5位随机序号（00001-99999）
 */
function generateSequence(): string {
  const seq = Math.floor(Math.random() * 99999) + 1;
  return String(seq).padStart(5, '0');
}

/**
 * 生成设备编号
 * 格式: DEV-yyyyMMdd-xxxxx
 */
export function generateDeviceCode(): string {
  return `DEV-${getDateString()}-${generateSequence()}`;
}

/**
 * 生成互联网账号编号
 * 格式: ACC-yyyyMMdd-xxxxx
 */
export function generateAccountCode(): string {
  return `ACC-${getDateString()}-${generateSequence()}`;
}
