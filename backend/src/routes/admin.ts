import type { Request, Response } from 'express';
import { Router } from 'express';
import { adminService } from '../services/adminService';
import { asyncHandler } from './asyncHandler';
import { parseIdParam } from './params';

const router = Router();

router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const users = await adminService.listUsers(req.user);
  return res.json({ code: 200, data: users, message: 'success' });
}));

router.post('/users', asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.createUser(req.user, req.body);
  return res.status(201).json({ code: 201, data: user, message: 'created' });
}));

router.put('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUser(req.user, parseIdParam(req.params.id), req.body);
  return res.json({ code: 200, data: user, message: 'success' });
}));

router.get('/departments', asyncHandler(async (_req: Request, res: Response) => {
  const departments = await adminService.listDepartments();
  return res.json({ code: 200, data: departments, message: 'success' });
}));

router.post('/departments', asyncHandler(async (req: Request, res: Response) => {
  const department = await adminService.createDepartment(req.user, req.body);
  return res.status(201).json({ code: 201, data: department, message: 'created' });
}));

router.put('/departments/:id', asyncHandler(async (req: Request, res: Response) => {
  const department = await adminService.updateDepartment(req.user, parseIdParam(req.params.id), req.body);
  return res.json({ code: 200, data: department, message: 'success' });
}));

export default router;
