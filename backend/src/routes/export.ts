import { Router, Request, Response } from 'express';
import { exportService } from '../services/exportService';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

/**
 * GET /api/export
 * 导出数据（Excel）
 * Query params:
 *   - viewType: 'device' | 'phone' | 'account' (必填)
 *   - search, status, risk_level, department_id, carrier, platform (可选过滤)
 *
 * 响应为 xlsx 文件下载
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const viewType = req.query.viewType as string;
    if (!['device', 'phone', 'account'].includes(viewType)) {
      res.status(400).json({ code: 400, data: null, message: '无效的导出视图类型，请使用 device/phone/account' });
      return;
    }

    const user = {
      id: Number(req.user?.id),
      roles: (req.user?.roles as string[]) || [],
    };

    const filters = {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      risk_level: req.query.risk_level as string | undefined,
      department_id: req.query.department_id ? Number(req.query.department_id) : undefined,
      carrier: req.query.carrier as string | undefined,
      platform: req.query.platform as string | undefined,
    };

    const buffer = await exportService.exportData(viewType as 'device' | 'phone' | 'account', filters, user);

    const filename = `${viewType}_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ code: 500, data: null, message: error.message || '导出失败' });
  }
});

export default router;
