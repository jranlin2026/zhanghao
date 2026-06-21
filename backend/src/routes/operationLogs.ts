import type { Request, Response } from 'express';
import { Router } from 'express';
import { assetsService } from '../services/assetsService';
import { asyncHandler } from './asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const result = await assetsService.logs(req.user, req.query);
  return res.json({ code: 200, message: 'success', ...result });
}));

export default router;
