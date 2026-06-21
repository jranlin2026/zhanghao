import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/admin/users
 * 获取用户列表
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const adminService = await import('../services/adminService');
    const result = await adminService.getUsers(req.query as any);
    return res.json(result);
  } catch (err: any) {
    console.error('[Admin] Users list error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * POST /api/admin/users
 * 新增用户
 */
router.post('/users', async (req: Request, res: Response) => {
  try {
    const adminService = await import('../services/adminService');
    const result = await adminService.createUser(req.body, (req as any).user?.id);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error('[Admin] Create user error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * PUT /api/admin/users/:id
 * 编辑用户
 */
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的用户ID' });
    }
    const adminService = await import('../services/adminService');
    const result = await adminService.updateUser(id, req.body, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Admin] Update user error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * GET /api/admin/departments
 * 获取部门列表
 */
router.get('/departments', async (_req: Request, res: Response) => {
  try {
    const adminService = await import('../services/adminService');
    const result = await adminService.getDepartments();
    return res.json(result);
  } catch (err: any) {
    console.error('[Admin] Departments list error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * POST /api/admin/departments
 * 新增部门
 */
router.post('/departments', async (req: Request, res: Response) => {
  try {
    const adminService = await import('../services/adminService');
    const result = await adminService.createDepartment(req.body, (req as any).user?.id);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error('[Admin] Create department error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * PUT /api/admin/departments/:id
 * 编辑部门
 */
router.put('/departments/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ code: 400, data: null, message: '无效的部门ID' });
    }
    const adminService = await import('../services/adminService');
    const result = await adminService.updateDepartment(id, req.body, (req as any).user?.id);
    return res.json(result);
  } catch (err: any) {
    console.error('[Admin] Update department error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * GET /api/admin/roles
 * 获取角色列表
 */
router.get('/roles', async (_req: Request, res: Response) => {
  try {
    const adminService = await import('../services/adminService');
    const result = await adminService.getRoles();
    return res.json(result);
  } catch (err: any) {
    console.error('[Admin] Roles list error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

/**
 * GET /api/admin/dict/:type
 * 获取字典项
 */
router.get('/dict/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const adminService = await import('../services/adminService');
    const result = await adminService.getDict(type);
    return res.json(result);
  } catch (err: any) {
    console.error('[Admin] Dict error:', err);
    return res.status(500).json({ code: 500, data: null, message: err.message || '服务器内部错误' });
  }
});

export default router;
