import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/internet-accounts
 * 获取互联网账号列表（分页/筛选）
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const accountService = await import('../services/accountService');
    const result = await accountService.getAccounts(req.query as any);
    return res.json(result);
  } catch (err: any) {
    console.error('[Accounts] List error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * GET /api/internet-accounts/:id
 * 获取账号详情
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的账号ID' });
    }
    const accountService = await import('../services/accountService');
    const result = await accountService.getAccountById(id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Accounts] Get by ID error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * POST /api/internet-accounts
 * 新增互联网账号
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const accountService = await import('../services/accountService');
    const result = await accountService.createAccount(req.body, (req as any).user?.id);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error('[Accounts] Create error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * PUT /api/internet-accounts/:id
 * 编辑互联网账号
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的账号ID' });
    }
    const accountService = await import('../services/accountService');
    const result = await accountService.updateAccount(id, req.body, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Accounts] Update error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * DELETE /api/internet-accounts/:id
 * 软删除互联网账号
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的账号ID' });
    }
    const accountService = await import('../services/accountService');
    const result = await accountService.deleteAccount(id, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Accounts] Delete error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * POST /api/internet-accounts/batch
 * 批量操作
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { ids, action, value } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ code: 400, data: null, message: '请选择要操作的账号' });
    }
    const accountService = await import('../services/accountService');
    const result = await accountService.batchOperation(ids, action, value, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Accounts] Batch error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

export default router;
