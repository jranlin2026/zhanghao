import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/operation-logs
 * 获取操作日志列表（分页/筛选）
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const logService = await import('../services/logService');
    const result = await logService.getLogs(req.query as any);
    return res.json(result);
  } catch (err: any) {
    console.error('[Logs] List error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

export default router;
