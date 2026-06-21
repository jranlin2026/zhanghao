import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/phone-numbers
 * 获取手机号列表（分页/筛选）
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const phoneService = await import('../services/phoneService');
    const result = await phoneService.getPhones(req.query as any);
    return res.json(result);
  } catch (err: any) {
    console.error('[Phones] List error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * GET /api/phone-numbers/:id
 * 获取手机号详情
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的手机号ID' });
    }
    const phoneService = await import('../services/phoneService');
    const result = await phoneService.getPhoneById(id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Phones] Get by ID error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * POST /api/phone-numbers
 * 新增手机号
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const phoneService = await import('../services/phoneService');
    const result = await phoneService.createPhone(req.body, (req as any).user?.id);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error('[Phones] Create error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * PUT /api/phone-numbers/:id
 * 编辑手机号
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的手机号ID' });
    }
    const phoneService = await import('../services/phoneService');
    const result = await phoneService.updatePhone(id, req.body, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Phones] Update error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * DELETE /api/phone-numbers/:id
 * 软删除手机号
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的手机号ID' });
    }
    const phoneService = await import('../services/phoneService');
    const result = await phoneService.deletePhone(id, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Phones] Delete error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

export default router;
