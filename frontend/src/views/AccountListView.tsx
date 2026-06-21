import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, batchOperation } from '@/api/accounts';
import type { InternetAccountDTO } from '@/types/account';
import EntityTable, { ColumnDef } from '@/components/common/EntityTable';
import StatusBadge from '@/components/common/StatusBadge';
import RiskBadge from '@/components/common/RiskBadge';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import BatchActionBar from '@/components/common/BatchActionBar';
import { useSelectionStore } from '@/stores/selectionStore';
import { useUIStore } from '@/stores/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';
import { PLATFORM_TYPES, PERMISSION_STATUS_COLORS } from '@/utils/constants';
import { maskLoginAccount, maskPhone, formatDate } from '@/utils/formatters';

const STATUS_OPTIONS = [
  { value: '启用中', label: '启用中' },
  { value: '闲置', label: '闲置' },
  { value: '已注销', label: '已注销' },
];

const PLATFORM_OPTIONS = PLATFORM_TYPES.map((p) => ({ value: p, label: p }));

const RISK_OPTIONS = [
  { value: 'high', label: '高风险' },
  { value: 'medium', label: '中风险' },
  { value: 'low', label: '低风险' },
  { value: 'none', label: '正常' },
];

const PERMISSION_OPTIONS = [
  { value: '已授权', label: '已授权' },
  { value: '待授权', label: '待授权' },
  { value: '已过期', label: '已过期' },
];

const BATCH_ACTIONS = [
  { key: 'revoke_permission', label: '收回权限' },
  { key: 'change_owner', label: '移交负责人', description: '请选择一个新负责人' },
  { key: 'mark_high_risk', label: '标记高风险', danger: true, description: '确认将选中账号标记为高风险？' },
  { key: 'export', label: '导出所选' },
];

interface AccountListViewProps {
  searchKeyword?: string;
  onSearchChange?: (keyword: string) => void;
}

/**
 * 互联网账号列表视图
 * 跨设备展示所有互联网账号，支持批量操作
 */
const AccountListView: React.FC<AccountListViewProps> = ({ searchKeyword, onSearchChange }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState(searchKeyword || '');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedFilters = useDebounce(filters, 200);

  const { setSelection } = useSelectionStore();
  const { openPanel, showToast } = useUIStore();
  const { canBatch } = usePermission();
  const queryClient = useQueryClient();

  // 账号列表查询
  const { data: accountRes, isLoading } = useQuery({
    queryKey: ['accounts', page, pageSize, debouncedSearch, sortBy, sortOrder, debouncedFilters],
    queryFn: () =>
      getAccounts({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        platform: debouncedFilters.platform || undefined,
        status: debouncedFilters.status || undefined,
        risk_level: debouncedFilters.risk_level || undefined,
        permission_status: debouncedFilters.permission_status || undefined,
      }),
  });

  // 批量操作
  const batchMutation = useMutation({
    mutationFn: (data: { action: string; value?: string | number }) =>
      batchOperation({ ids: selectedIds, action: data.action as any, value: data.value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showToast('success', '批量操作成功');
      setSelectedIds([]);
    },
    onError: (err: Error) => {
      showToast('error', `操作失败: ${err.message}`);
    },
  });

  const accounts = accountRes?.data || [];
  const pagination = accountRes?.pagination;

  const columns: ColumnDef<InternetAccountDTO>[] = [
    { key: 'account_code', label: '账号编号', width: 170, sortable: true },
    {
      key: 'platform',
      label: '平台',
      width: 90,
      render: (val) => (
        <span style={{ padding: '2px 8px', borderRadius: 4, backgroundColor: '#F3F4F6', fontSize: 12, color: '#374151' }}>
          {val as string}
        </span>
      ),
    },
    { key: 'account_name', label: '账号名称', width: 140, sortable: true },
    { key: 'login_account', label: '登录账号', width: 150, render: (val) => maskLoginAccount(val as string) },
    { key: 'bind_phone', label: '绑定手机号', width: 130, render: (val) => maskPhone(val as string) },
    { key: 'owner_name', label: '负责人', width: 90, render: (val) => val || '-' },
    { key: 'current_user_name', label: '当前使用人', width: 90, render: (val) => val || '-' },
    {
      key: 'permission_status',
      label: '权限状态',
      width: 90,
      render: (val) => {
        const perm = val as string;
        const color = PERMISSION_STATUS_COLORS[perm as keyof typeof PERMISSION_STATUS_COLORS] || '#6B7280';
        return (
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, backgroundColor: `${color}15`, color }}>
            {perm}
          </span>
        );
      },
    },
    { key: 'status', label: '账号状态', width: 90, render: (val) => <StatusBadge status={val as string} /> },
    { key: 'risk_level', label: '风险等级', width: 80, render: (val) => <RiskBadge level={val as string} /> },
    {
      key: 'updated_at',
      label: '更新时间',
      width: 150,
      sortable: true,
      render: (val) => formatDate(val as string),
    },
  ];

  const filterFields = [
    { key: 'platform', label: '平台类型', options: PLATFORM_OPTIONS, width: 130 },
    { key: 'status', label: '状态', options: STATUS_OPTIONS, width: 120 },
    { key: 'risk_level', label: '风险等级', options: RISK_OPTIONS, width: 130 },
    { key: 'permission_status', label: '权限状态', options: PERMISSION_OPTIONS, width: 120 },
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (row: InternetAccountDTO) => {
    setSelection('account', row.id, row as unknown as Record<string, unknown>, `${row.account_name} (${row.platform})`);
    openPanel();
  };

  const handleBatchAction = (action: string) => {
    batchMutation.mutate({ action });
  };

  return (
    <div>
      {/* 搜索 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            onSearchChange?.(v);
            setPage(1);
          }}
        />
      </div>

      {/* 筛选 */}
      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(key, value) => {
          setFilters((prev) => ({ ...prev, [key]: value }));
          setPage(1);
        }}
        onReset={() => {
          setFilters({});
          setPage(1);
        }}
      />

      {/* 批量操作栏 */}
      <BatchActionBar
        selectedCount={selectedIds.length}
        actions={BATCH_ACTIONS}
        onAction={handleBatchAction}
        onClear={() => setSelectedIds([])}
      />

      {/* 表格 */}
      <EntityTable
        columns={columns}
        data={accounts}
        loading={isLoading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={handleRowClick}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        selectable={canBatch}
        emptyMessage="暂无互联网账号数据"
      />
    </div>
  );
};

export default AccountListView;
