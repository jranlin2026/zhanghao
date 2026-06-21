import jwt from 'jsonwebtoken';
import { env } from './env';

/**
 * JWT 配置
 */

/** JWT 负载结构 */
export interface JwtPayload {
  userId: number;
  name: string;
  roles: string[];
}

/**
 * 生成 JWT Token
 * @param payload 负载信息
 * @returns JWT Token 字符串
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256',
  });
}

/**
 * 验证 JWT Token
 * @param token JWT Token 字符串
 * @returns 解码后的负载
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
  }) as JwtPayload;
}
