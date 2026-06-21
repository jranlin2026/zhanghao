import type { Request, Response } from 'express';
import { Router } from 'express';
import { assetsService } from '../services/assetsService';
import { asyncHandler } from './asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const meta = await assetsService.meta(req.user);
  return res.json({ code: 200, data: meta, message: 'success' });
}));

export default router;
