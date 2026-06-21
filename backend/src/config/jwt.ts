import jwt from 'jsonwebtoken';
import { env } from './env';

export interface JwtPayload {
  userId: number;
  name: string;
  roles: string[];
  departmentId: number | null;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256',
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
  }) as JwtPayload;
}
