import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ code: 400, data: null, message: '用户名和密码不能为空' });
    }

    // 调用 authService 处理登录逻辑
    const { authService } = await import('../services/authService');
    const result = await authService.login(name, password);

    return res.json({ code: 200, data: result, message: '登录成功' });
  } catch (err: any) {
    if (err.message === '用户不存在' || err.message === '密码错误') {
      return res.status(401).json({ code: 401, data: null, message: err.message });
    }
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ code: 500, data: null, message: '服务器内部错误' });
  }
});

/**
 * GET /api/auth/profile
 * 获取当前用户信息（需认证）
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, data: null, message: '未登录' });
    }

    const { authService } = await import('../services/authService');
    const user = await authService.getProfile(userId);

    return res.json({ code: 200, data: user, message: 'ok' });
  } catch (err: any) {
    console.error('[Auth] Profile error:', err);
    return res.status(500).json({ code: 500, data: null, message: '服务器内部错误' });
  }
});

export default router;
