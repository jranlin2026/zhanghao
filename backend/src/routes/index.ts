import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import authRoutes from './auth';
import deviceRoutes from './devices';
import phoneRoutes from './phones';
import accountRoutes from './accounts';
import logRoutes from './logs';
import riskRoutes from './risks';
import adminRoutes from './admin';
import sensitiveRoutes from './sensitive';
import importRoutes from './import';
import exportRoutes from './export';

const router = Router();

// 公开路由
router.use('/auth', authRoutes);

// 需要认证的路由
router.use('/devices', authMiddleware, deviceRoutes);
router.use('/phone-numbers', authMiddleware, phoneRoutes);
router.use('/internet-accounts', authMiddleware, accountRoutes);
router.use('/operation-logs', authMiddleware, logRoutes);
router.use('/risks', authMiddleware, riskRoutes);
router.use('/admin', authMiddleware, adminRoutes);
router.use('/internet-accounts', authMiddleware, sensitiveRoutes);
router.use('/import', authMiddleware, importRoutes);
router.use('/export', authMiddleware, exportRoutes);

export default router;
