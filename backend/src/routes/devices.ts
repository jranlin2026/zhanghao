import { Router, Request, Response } from 'express';
import { getLocalDeviceStats, listLocalDevices } from '../services/devData';

const router = Router();

/**
 * GET /api/devices
 * 获取设备列表（分页/筛选/搜索）
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = listLocalDevices(req.query as any);
    return res.json({ code: 200, message: 'success', ...result });
  } catch (err: any) {
    console.error('[Devices] List error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * GET /api/devices/stats
 * 获取设备 KPI 统计
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    return res.json({ code: 200, data: getLocalDeviceStats(), message: 'success' });
  } catch (err: any) {
    console.error('[Devices] Stats error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * GET /api/devices/:id
 * 获取设备详情
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的设备ID' });
    }
    const deviceService = await import('../services/deviceService');
    const result = await deviceService.getDeviceById(id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Devices] Get by ID error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * POST /api/devices
 * 新增设备
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const deviceService = await import('../services/deviceService');
    const result = await deviceService.createDevice(req.body, (req as any).user?.id);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error('[Devices] Create error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * PUT /api/devices/:id
 * 编辑设备
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的设备ID' });
    }
    const deviceService = await import('../services/deviceService');
    const result = await deviceService.updateDevice(id, req.body, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Devices] Update error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * DELETE /api/devices/:id
 * 软删除设备
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的设备ID' });
    }
    const deviceService = await import('../services/deviceService');
    const result = await deviceService.deleteDevice(id, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Devices] Delete error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

export default router;
