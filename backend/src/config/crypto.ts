import crypto from 'crypto';
import { env } from './env';

/**
 * AES-256-GCM 加解密工具
 * 用于敏感信息字段级加密
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * 将 hex 密钥转换为 Buffer
 */
function getKey(): Buffer {
  return Buffer.from(env.ENCRYPTION_KEY, 'hex');
}

/**
 * 加密明文
 * @param plaintext 明文文本
 * @returns 加密结果（hex 编码：iv + authTag + ciphertext）
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // 格式: iv(16字节hex) + authTag(16字节hex) + ciphertext
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

/**
 * 解密密文
 * @param ciphertext 加密结果（hex 编码）
 * @returns 明文文本
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();

  const ivHex = ciphertext.slice(0, IV_LENGTH * 2);
  const authTagHex = ciphertext.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2);
  const encryptedText = ciphertext.slice((IV_LENGTH + TAG_LENGTH) * 2);

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * 检查字符串是否为已加密的密文
 * 通过判断长度和 hex 编码特征
 */
export function isEncrypted(text: string): boolean {
  // 加密结果至少需要 (16+16) * 2 = 64 字符的 iv+tag 前缀
  if (text.length < 64) return false;
  // 检查是否为有效 hex
  return /^[0-9a-f]+$/i.test(text);
}
