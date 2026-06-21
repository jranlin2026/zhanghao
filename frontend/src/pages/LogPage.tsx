import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Box,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { getLogs } from '@/api/logs';
import type { OperationLogDTO } from '@/types/log';
import type { PaginationMeta } from '@/types/api';
import Pagination from '@/components/common/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { ACTION_TYPE_OPTIONS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import { TableSkeleton } from '@/components/common/Skeleton';

const TARGET_TYPE_OPTIONS = [
  { value: 'devices', label: '设备' },
  { value: 'phone_numbers', label: '手机号' },
  { value: 'internet_accounts', label: '互联网账号' },
];

/**
 * 操作日志页
 * 筛选 + 表格（展开行查看 before/after JSON）
 */
const LogPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [actionType, setActionType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data: logRes, isLoading } = useQuery({
    queryKey: ['logs', page, pageSize, actionType, targetType, debouncedSearch],
    queryFn: () =>
      getLogs({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        action_type: actionType || undefined,
        target_type: targetType || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      }),
  });

  const logs = logRes?.data || [];
  const pagination: PaginationMeta = logRes?.pagination || { page, pageSize, total: 0 };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', margin: 0 }}>操作日志</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>查看所有用户的操作记录</p>
      </div>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            displayEmpty
            value={actionType}
            onChange={(e) => { setActionType(e.target.value); setPage(1); }}
            renderValue={(v) => v ? (ACTION_TYPE_OPTIONS.find(o => o.value === v)?.label || v) : <span style={{ color: '#9CA3AF', fontSize: 13 }}>操作类型</span>}
            sx={{ fontSize: 13, borderRadius: '8px', backgroundColor: '#F9FAFB' }}
          >
            <MenuItem value=""><em style={{ color: '#9CA3AF' }}>全部</em></MenuItem>
            {ACTION_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            displayEmpty
            value={targetType}
            onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
            renderValue={(v) => v ? (TARGET_TYPE_OPTIONS.find(o => o.value === v)?.label || v) : <span style={{ color: '#9CA3AF', fontSize: 13 }}>目标类型</span>}
            sx={{ fontSize: 13, borderRadius: '8px', backgroundColor: '#F9FAFB' }}
          >
            <MenuItem value=""><em style={{ color: '#9CA3AF' }}>全部</em></MenuItem>
            {TARGET_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="搜索操作人、目标名称..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '8px', backgroundColor: '#F9FAFB' },
          }}
        />
      </div>

      {/* 日志表格 */}
      <TableContainer sx={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ backgroundColor: '#F9FAFB', width: 40 }} />
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>时间</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>操作人</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>操作类型</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>目标类型</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>目标名称</TableCell>
              <TableCell sx={{ backgroundColor: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>IP 地址</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} style={{ padding: 0, border: 'none' }}>
                  <TableSkeleton rows={5} columns={6} />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ padding: '48px 16px', color: '#9CA3AF', fontSize: 14, borderBottom: 'none' }}>
                  暂无操作日志
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow
                    hover
                    sx={{ '&:hover': { backgroundColor: '#F9FAFB' } }}
                  >
                    <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #F3F4F6' }}>
                      <IconButton
                        size="small"
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                      >
                        {expandedRow === log.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>
                      {log.operator_name || `用户#${log.operator_id}`}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>
                      {log.action_type}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>
                      {log.target_type}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>
                      {log.target_name || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                  {/* 展开行：查看 before/after */}
                  <TableRow>
                    <TableCell colSpan={7} style={{ padding: 0, borderBottom: expandedRow === log.id ? '1px solid #F3F4F6' : 'none' }}>
                      <Collapse in={expandedRow === log.id} timeout="auto" unmountOnExit>
                        <Box sx={{ padding: '12px 24px', backgroundColor: '#FAFBFC' }}>
                          <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>修改前 (Before)</div>
                              {log.before_data ? (
                                <pre style={{ fontSize: 12, backgroundColor: '#F3F4F6', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200, margin: 0 }}>
                                  {JSON.stringify(JSON.parse(log.before_data), null, 2)}
                                </pre>
                              ) : (
                                <div style={{ fontSize: 12, color: '#9CA3AF' }}>无</div>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>修改后 (After)</div>
                              {log.after_data ? (
                                <pre style={{ fontSize: 12, backgroundColor: '#F3F4F6', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200, margin: 0 }}>
                                  {JSON.stringify(JSON.parse(log.after_data), null, 2)}
                                </pre>
                              ) : (
                                <div style={{ fontSize: 12, color: '#9CA3AF' }}>无</div>
                              )}
                            </div>
                          </div>
                          {log.remark && (
                            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
                              备注: {log.remark}
                            </div>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
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
    </div>
  );
};

export default LogPage;
