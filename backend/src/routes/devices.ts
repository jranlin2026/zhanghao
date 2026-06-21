import type { Request, Response } from 'express';
import { Router } from 'express';
import { getLocalDeviceById, getLocalDeviceStats, listLocalDevices } from '../services/devData';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const result = listLocalDevices(req.query);
  return res.json({ code: 200, message: 'success', ...result });
});

router.get('/stats', (_req: Request, res: Response) => {
  return res.json({ code: 200, data: getLocalDeviceStats(), message: 'success' });
});

router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const device = Number.isFinite(id) ? getLocalDeviceById(id) : null;

  if (!device) {
    return res.status(404).json({ code: 404, data: null, message: '设备不存在' });
  }

  return res.json({ code: 200, data: device, message: 'success' });
});

export default router;
