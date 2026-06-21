import type { Request, Response } from 'express';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth';
import { authService } from '../services/authService';
import { asyncHandler } from './asyncHandler';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { code: 429, data: null, message: '登录尝试过于频繁，请稍后再试' },
});

router.post('/login', loginLimiter, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ code: 400, data: null, message: '用户名和密码不能为空' });
    }

    const result = await authService.login(name, password);
    return res.json({ code: 200, data: result, message: '登录成功' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '登录失败';
    const statusCode = message === '用户名或密码错误' ? 401 : 500;
    return res.status(statusCode).json({ code: statusCode, data: null, message });
  }
}));

router.get('/profile', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ code: 401, data: null, message: '未登录' });
    }

    const user = await authService.getProfile(req.user.id);
    return res.json({ code: 200, data: user, message: 'success' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取用户信息失败';
    return res.status(500).json({ code: 500, data: null, message });
  }
}));

export default router;
