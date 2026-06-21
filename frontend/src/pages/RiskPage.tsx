import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { getRisks, updateRiskStatus, triggerFullScan } from '@/api/risks';
import type { RiskDTO } from '@/types/risk';
import type { PaginationMeta } from '@/types/api';
import RiskBadge from '@/components/common/RiskBadge';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useSelectionStore } from '@/stores/selectionStore';
import { useUIStore } from '@/stores/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { RISK_LEVEL_LABELS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import { TableSkeleton } from '@/components/common/Skeleton';
import { useNavigate } from 'react-router-dom';

const RISK_STATUS_OPTIONS = [
  { value: 'open', label: '未处理' },
  { value: 'ignored', label: '已忽略' },
  { value: 'resolved', label: '已解决' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'device', label: '设备' },
  { value: 'phone', label: '手机号' },
  { value: 'account', label: '互联网账号' },
];

const RISK_LEVEL_FILTER = [
  { value: 'high', label: '高风险' },
  { value: 'medium', label: '中风险' },
  { value: 'low', label: '低风险' },
  { value: 'none', label: '正常' },
];

/**
 * 风险提醒页
 * 筛选 + 风险列表 + 忽略/解决操作
 */
const RiskPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [riskLevel, setRiskLevel] = useState('');
  const [riskStatus, setRiskStatus] = useState('');
  const [entityType, setEntityType] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ riskId: number; action: 'ignored' | 'resolved' } | null>(null);

  const { setSelection } = useSelectionStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: riskRes, isLoading } = useQuery({
    queryKey: ['risks', page, pageSize, riskLevel, riskStatus, entityType],
    queryFn: () =>
      getRisks({
        page,
        pageSize,
        risk_level: riskLevel || undefined,
        status: riskStatus || undefined,
        entity_type: entityType || undefined,
        sortBy: 'detected_at',
        sortOrder: 'desc',
      }),
  });

  // 更新风险状态
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ignored' | 'resolved' }) =>
      updateRiskStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      showToast('success', '风险状态已更新');
    },
    onError: (err: Error) => {
      showToast('error', `操作失败: ${err.message}`);
    },
  });

  // 全量扫描
  const scanMutation = useMutation({
    mutationFn: () => triggerFullScan(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      showToast('success', `扫描完成，共发现 ${res.data?.scanned || 0} 个风险`);
    },
    onError: (err: Error) => {
      showToast('error', `扫描失败: ${err.message}`);
    },
  });

  const risks = riskRes?.data || [];
  const pagination: PaginationMeta = riskRes?.pagination || { page, pageSize, total: 0 };

  const handleRowClick = (risk: RiskDTO) => {
    // 更新 selectionStore + 导航到资产页
    setSelection(risk.entity_type as any, risk.entity_id, { risk }, risk.entity_name || '');
    navigate('/');
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    statusMutation.mutate({ id: confirmAction.riskId, status: confirmAction.action });
    setConfirmAction(null);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: '未处理', color: '#DC2626' },
    ignored: { label: '已忽略', color: '#9CA3AF' },
    resolved: { label: '已解决', color: '#059669' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', margin: 0 }}>风险提醒</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>自动检测账号资产中的安全隐患</p>
        </div>
        <Button
          variant="outlined"
          size="small"
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          sx={{ textTransform: 'none', fontSize: 13, borderRadius: '8px', borderColor: 'var(--color-border)', color: '#374151' }}
        >
          {scanMutation.isPending ? '扫描中...' : '重新扫描'}
        </Button>
      </div>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            displayEmpty
            value={riskLevel}
            onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
            renderValue={(v) => v ? RISK_LEVEL_LABELS[v as keyof typeof RISK_LEVEL_LABELS] : <span style={{ color: '#9CA3AF', fontSize: 13 }}>风险等级</span>}
            sx={{ fontSize: 13, borderRadius: '8px', backgroundColor: '#F9FAFB' }}
          >
            <MenuItem value=""><em style={{ color: '#9CA3AF' }}>全部</em></MenuItem>
            {RISK_LEVEL_FILTER.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            displayEmpty
            value={riskStatus}
            onChange={(e) => { setRiskStatus(e.target.value); setPage(1); }}
            renderValue={(v) => v ? (RISK_STATUS_OPTIONS.find(o => o.value === v)?.label || v) : <span style={{ color: '#9CA3AF', fontSize: 13 }}>状态</span>}
            sx={{ fontSize: 13, borderRadius: '8px', backgroundColor: '#F9FAFB' }}
          >
            <MenuItem value=""><em style={{ color: '#9CA3AF' }}>全部</em></MenuItem>
            {RISK_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            displayEmpty
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
            renderValue={(v) => v ? (ENTITY_TYPE_OPTIONS.find(o => o.value === v)?.label || v) : <span style={{ color: '#9CA3AF', fontSize: 13 }}>实体类型</span>}
            sx={{ fontSize: 13, borderRadius: '8px', backgroundColor: '#F9FAFB' }}
          >
            <MenuItem value=""><em style={{ color: '#9CA3AF' }}>全部</em></MenuItem>
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* 风险列表表格 */}
      <TableContainer sx={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>风险等级</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>风险标题</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>关联实体</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>风险原因</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>建议</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>状态</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>检测时间</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && risks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} style={{ padding: 0, border: 'none' }}>
                  <TableSkeleton rows={5} columns={7} />
                </TableCell>
              </TableRow>
            ) : risks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ padding: '48px 16px', color: '#9CA3AF', fontSize: 14, borderBottom: 'none' }}>
                  暂无风险数据
                </TableCell>
              </TableRow>
            ) : (
              risks.map((risk) => {
                const statusInfo = statusLabels[risk.status] || { label: risk.status, color: '#6B7280' };
                return (
                  <TableRow
                    key={risk.id}
                    hover
                    onClick={() => handleRowClick(risk)}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' } }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                      <RiskBadge level={risk.risk_level} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500, color: '#1F2937', borderBottom: '1px solid #F3F4F6' }}>
                      {risk.risk_title}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>
                      {risk.entity_name || `${risk.entity_type}#${risk.entity_id}`}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {risk.risk_reason}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {risk.suggestion || '-'}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }}>
                      <Chip
                        label={statusInfo.label}
                        size="small"
                        sx={{
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: `${statusInfo.color}15`,
                          color: statusInfo.color,
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                      {formatDate(risk.detected_at)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #F3F4F6' }} onClick={(e) => e.stopPropagation()}>
                      {risk.status === 'open' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setConfirmAction({ riskId: risk.id, action: 'resolved' })}
                            sx={{ fontSize: 12, textTransform: 'none', color: '#059669', minWidth: 'auto', padding: '2px 8px' }}
                          >
                            解决
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setConfirmAction({ riskId: risk.id, action: 'ignored' })}
                            sx={{ fontSize: 12, textTransform: 'none', color: '#9CA3AF', minWidth: 'auto', padding: '2px 8px' }}
                          >
                            忽略
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页 */}
      <div style={{ border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>

      {/* 确认弹窗 */}
      {confirmAction && (
        <ConfirmDialog
          open={true}
          title={confirmAction.action === 'resolved' ? '确认解决风险' : '确认忽略风险'}
          message={
            confirmAction.action === 'resolved'
              ? '确认将此风险标记为已解决？'
              : '确认忽略此风险？忽略后风险将不再显示在待处理列表中。'
          }
          confirmText={confirmAction.action === 'resolved' ? '已解决' : '忽略'}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
          danger={confirmAction.action === 'ignored'}
        />
      )}
    </div>
  );
};

export default RiskPage;
