import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import assetsRoutes from './assets';
import authRoutes from './auth';
import deviceRoutes from './devices';
import internetAccountRoutes from './internetAccounts';
import metaRoutes from './meta';
import operationLogRoutes from './operationLogs';
import phoneNumberRoutes from './phoneNumbers';
import riskRoutes from './risks';

const router = Router();

router.use('/auth', authRoutes);
router.use('/assets', authMiddleware, assetsRoutes);
router.use('/devices', authMiddleware, deviceRoutes);
router.use('/phone-numbers', authMiddleware, phoneNumberRoutes);
router.use('/internet-accounts', authMiddleware, internetAccountRoutes);
router.use('/operation-logs', authMiddleware, operationLogRoutes);
router.use('/risks', authMiddleware, riskRoutes);
router.use('/meta', authMiddleware, metaRoutes);

export default router;
