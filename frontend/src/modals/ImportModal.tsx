import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import { CloudUpload, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import apiClient from '@/api/client';
import { useUIStore } from '@/stores/uiStore';
import { useQueryClient } from '@tanstack/react-query';

/** 导入视图类型 */
type ImportViewType = 'device' | 'phone' | 'account';

interface PreviewData {
  columns: string[];
  rows: { rowIndex: number; data: Record<string, string>; valid: boolean; error?: string }[];
  required: string[];
  totalRows: number;
}

interface ImportResult {
  total: number;
  devices_created: number;
  phones_created: number;
  accounts_created: number;
  errors: string[];
}

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  /** 导入哪种类型的视图 */
  viewType: ImportViewType;
}

const VIEW_REQUIRED_COLUMNS: Record<ImportViewType, string[]> = {
  device: ['device_name', 'brand_model', 'imei', 'sim_type'],
  phone: ['phone_number', 'carrier', 'slot_type', 'device_code'],
  account: ['platform', 'account_name', 'login_account', 'phone_number'],
};

const VIEW_LABELS: Record<ImportViewType, string> = {
  device: '设备',
  phone: '手机号',
  account: '互联网账号',
};

/**
 * 导入弹窗
 *
 * - 文件上传（CSV/Excel，限 10MB）
 * - 上传后显示预览（列映射 + 校验结果）
 * - 确认导入 → POST /api/import
 * - 导入结果展示（成功数/失败数/错误详情）
 * - 分三步：上传文件 → 预览 → 确认导入
 */
const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, viewType }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  // 重置状态
  const resetState = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setImporting(false);
  };

  // 弹窗打开时重置
  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  /** 文件选择 */
  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;

    // 校验文件大小（10MB）
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('文件大小超过 10MB 限制');
      return;
    }

    // 校验文件类型
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setError('仅支持 CSV、Excel (.xlsx/.xls) 文件');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // 自动预览
    handlePreview(selectedFile);
  }, [viewType]);

  /** 上传预览 */
  const handlePreview = async (fileToPreview: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToPreview);
      formData.append('viewType', viewType);

      const res = await apiClient.post<{ code: number; data: PreviewData; message: string }>(
        '/import/preview',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setPreview(res.data.data);
    } catch (err: any) {
      setError(err.message || '预览文件失败');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  /** 确认导入 */
  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('viewType', viewType);

      const res = await apiClient.post<{ code: number; data: ImportResult; message: string }>(
        '/import',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setResult(res.data.data);
      showToast('success', `${VIEW_LABELS[viewType]}导入完成`);
      // 刷新相关列表
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['phones'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    } catch (err: any) {
      setError(err.message || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const validCount = preview?.rows.filter((r) => r.valid).length || 0;
  const invalidCount = preview ? preview.totalRows - validCount : 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ style: { borderRadius: 12, maxHeight: '90vh' } }}
    >
      <DialogTitle>导入{VIEW_LABELS[viewType]}数据</DialogTitle>
      <DialogContent>
        {/* 文件上传区域 */}
        {!preview && !result && (
          <Box
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'var(--color-border)',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              backgroundColor: dragOver ? 'var(--color-primary-bg)' : '#FAFBFC',
              cursor: 'pointer',
              transition: 'all 0.2s',
              mb: 2,
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
            <CloudUpload sx={{ fontSize: 48, color: '#9CA3AF', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              点击或拖拽文件到此处上传
            </Typography>
            <Typography variant="caption" color="text.disabled">
              支持 CSV、Excel (.xlsx/.xls)，最大 10MB
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
              必填列: {VIEW_REQUIRED_COLUMNS[viewType].join(', ')}
            </Typography>
          </Box>
        )}

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* 加载中 */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              正在解析文件...
            </Typography>
          </Box>
        )}

        {/* 预览表格 */}
        {preview && !result && (
          <Box sx={{ mb: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography variant="body2" color="text.secondary">
                共 {preview.totalRows} 行数据
                <Chip label={`${validCount} 有效`} size="small" color="success" sx={{ ml: 1, fontSize: 11 }} />
                {invalidCount > 0 && (
                  <Chip label={`${invalidCount} 无效`} size="small" color="error" sx={{ ml: 0.5, fontSize: 11 }} />
                )}
              </Typography>
            </div>
            <TableContainer sx={{ maxHeight: 300, border: '1px solid var(--color-border)', borderRadius: 1 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: '#F9FAFB', fontWeight: 600, fontSize: 12 }}>行号</TableCell>
                    {preview.columns.map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          backgroundColor: '#F9FAFB',
                          fontWeight: preview.required.includes(col) ? 700 : 500,
                          fontSize: 12,
                          color: preview.required.includes(col) ? '#1F2937' : '#6B7280',
                        }}
                      >
                        {col}
                        {preview.required.includes(col) && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
                      </TableCell>
                    ))}
                    <TableCell sx={{ backgroundColor: '#F9FAFB', fontWeight: 600, fontSize: 12 }}>状态</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.rows.slice(0, 20).map((row) => (
                    <TableRow key={row.rowIndex}>
                      <TableCell sx={{ fontSize: 12, color: '#6B7280' }}>{row.rowIndex}</TableCell>
                      {preview.columns.map((col) => (
                        <TableCell key={col} sx={{ fontSize: 12, color: '#374151' }}>
                          {row.data[col] || '-'}
                        </TableCell>
                      ))}
                      <TableCell>
                        {row.valid ? (
                          <CheckCircle sx={{ fontSize: 16, color: '#059669' }} />
                        ) : (
                          <ErrorIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {preview.totalRows > 20 && (
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                仅显示前 20 行，共 {preview.totalRows} 行
              </Typography>
            )}
          </Box>
        )}

        {/* 导入结果 */}
        {result && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircle sx={{ fontSize: 48, color: '#059669', mb: 1 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              导入完成
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#1F2937' }}>{result.total}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>总计</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{result.devices_created + result.phones_created + result.accounts_created}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>成功</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: result.errors.length > 0 ? '#DC2626' : '#059669' }}>
                  {result.total - (result.devices_created + result.phones_created + result.accounts_created)}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>失败</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <Box sx={{ mt: 2, textAlign: 'left', maxHeight: 150, overflow: 'auto' }}>
                <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                  错误详情:
                </Typography>
                {result.errors.map((err, idx) => (
                  <Typography key={idx} variant="caption" display="block" color="error" sx={{ fontSize: 11 }}>
                    {err}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {result ? (
          <Button
            onClick={handleClose}
            variant="contained"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            关闭
          </Button>
        ) : preview ? (
          <>
            <Button
              onClick={() => { setPreview(null); setFile(null); setError(null); }}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none', color: '#374151', borderColor: 'var(--color-border)' }}
            >
              重新选择
            </Button>
            <Button
              onClick={handleImport}
              variant="contained"
              size="small"
              disabled={importing || validCount === 0}
              sx={{ textTransform: 'none' }}
            >
              {importing ? '导入中...' : `确认导入 (${validCount} 条)`}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleClose}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', color: '#374151', borderColor: 'var(--color-border)' }}
          >
            取消
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;
