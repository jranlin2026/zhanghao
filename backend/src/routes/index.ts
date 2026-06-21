import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import authRoutes from './auth';
import deviceRoutes from './devices';

const router = Router();

router.use('/auth', authRoutes);
router.use('/devices', authMiddleware, deviceRoutes);

export default router;
