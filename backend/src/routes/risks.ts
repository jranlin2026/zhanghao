import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/risks
 * 获取风险列表（分页/筛选）
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const riskService = await import('../services/riskService');
    const result = await riskService.getRisks(req.query as any);
    return res.json(result);
  } catch (err: any) {
    console.error('[Risks] List error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * PUT /api/risks/:id
 * 更新风险状态（忽略/解决）
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的风险ID' });
    }
    const { status } = req.body;
    if (!['open', 'ignored', 'resolved'].includes(status)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的风险状态值' });
    }
    const riskService = await import('../services/riskService');
    const result = await riskService.updateRiskStatus(id, status, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Risks] Update status error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * POST /api/risks/scan
 * 触发全量风险扫描
 */
router.post('/scan', async (_req: Request, res: Response) => {
  try {
    const riskService = await import('../services/riskService');
    const result = await riskService.runFullScan();
    return res.json(result);
  } catch (err: any) {
    console.error('[Risks] Scan error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

export default router;
