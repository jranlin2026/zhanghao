import type { Request, Response } from 'express';
import { Router } from 'express';
import { authService } from '../services/authService';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ code: 400, data: null, message: '用户名和密码不能为空' });
    }

    const result = await authService.login(name, password);
    return res.json({ code: 200, data: result, message: '登录成功' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '登录失败';
    const statusCode = ['用户不存在', '密码错误'].includes(message) ? 401 : 500;
    return res.status(statusCode).json({ code: statusCode, data: null, message });
  }
});

router.get('/profile', async (req: Request, res: Response) => {
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
});

export default router;
