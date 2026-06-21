import type { Request, Response } from 'express';
import { Router } from 'express';
import { assetsService } from '../services/assetsService';
import { asyncHandler } from './asyncHandler';
import { parseIdParam } from './params';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const result = await assetsService.listPhones(req.user, req.query);
  return res.json({ code: 200, message: 'success', ...result });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const phone = await assetsService.getPhone(req.user, parseIdParam(req.params.id));
  if (!phone) {
    return res.status(404).json({ code: 404, data: null, message: '手机号不存在' });
  }
  return res.json({ code: 200, data: phone, message: 'success' });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const phone = await assetsService.createPhone(req.user, req.body);
  return res.status(201).json({ code: 201, data: phone, message: 'created' });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const phone = await assetsService.updatePhone(req.user, parseIdParam(req.params.id), req.body);
  return res.json({ code: 200, data: phone, message: 'success' });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await assetsService.deletePhone(req.user, parseIdParam(req.params.id));
  return res.json({ code: 200, data: true, message: 'success' });
}));

export default router;
