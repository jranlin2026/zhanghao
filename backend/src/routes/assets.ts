import type { Request, Response } from 'express';
import { Router } from 'express';
import { assetsService } from '../services/assetsService';
import { asyncHandler } from './asyncHandler';

const router = Router();

router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = await assetsService.stats(req.user);
  return res.json({ code: 200, data: stats, message: 'success' });
}));

export default router;
