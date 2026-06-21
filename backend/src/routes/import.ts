import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { importService } from '../services/importService';
import { authMiddleware } from '../middleware/auth';

const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();
router.use(authMiddleware);

/**
 * POST /api/import/preview
 * 导入预览：解析上传文件，返回校验结果
 */
router.post('/preview', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ code: 400, data: null, message: '请上传文件' });
      return;
    }

    const viewType = req.body.viewType as 'device' | 'phone' | 'account';
    if (!['device', 'phone', 'account'].includes(viewType)) {
      res.status(400).json({ code: 400, data: null, message: '无效的导入视图类型，请使用 device/phone/account' });
      return;
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    const result = await importService.importPreview(fileBuffer, viewType);

    // 清理临时文件
    fs.unlink(req.file.path, () => {});

    res.json({ code: 200, data: result, message: '预览成功' });
  } catch (error: any) {
    res.status(400).json({ code: 400, data: null, message: error.message || '预览失败' });
  }
});

/**
 * POST /api/import
 * 确认导入：解析文件并将数据写入数据库
 */
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ code: 400, data: null, message: '请上传文件' });
      return;
    }

    const viewType = req.body.viewType as 'device' | 'phone' | 'account';
    if (!['device', 'phone', 'account'].includes(viewType)) {
      res.status(400).json({ code: 400, data: null, message: '无效的导入视图类型，请使用 device/phone/account' });
      return;
    }

    const operatorId = Number(req.user?.id);

    const fileBuffer = fs.readFileSync(req.file.path);

    const result = await importService.importConfirm(fileBuffer, viewType, operatorId);

    // 清理临时文件
    fs.unlink(req.file.path, () => {});

    res.json({ code: 200, data: result, message: '导入完成' });
  } catch (error: any) {
    res.status(400).json({ code: 400, data: null, message: error.message || '导入失败' });
  }
});

export default router;
