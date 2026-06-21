import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/internet-accounts/:id/sensitive
 * 查看敏感信息（写操作日志）
 */
router.get('/:id/sensitive', async (req: Request, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的账号ID' });
    }
    const sensitiveService = await import('../services/sensitiveService');
    const result = await sensitiveService.viewSensitive(accountId, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Sensitive] View error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * POST /api/internet-accounts/:id/sensitive/copy
 * 复制敏感信息（写操作日志）
 */
router.post('/:id/sensitive/copy', async (req: Request, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的账号ID' });
    }
    const { field } = req.body;
    if (!['login_password', 'real_name_info'].includes(field)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的敏感字段' });
    }
    const sensitiveService = await import('../services/sensitiveService');
    const result = await sensitiveService.copySensitiveField(accountId, field, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Sensitive] Copy error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * PUT /api/internet-accounts/:id/sensitive
 * 修改敏感信息
 */
router.put('/:id/sensitive', async (req: Request, res: Response) => {
  try {
    const accountId = Number(req.params.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的账号ID' });
    }
    const sensitiveService = await import('../services/sensitiveService');
    const result = await sensitiveService.updateSensitive(accountId, req.body, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Sensitive] Update error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

export default router;
