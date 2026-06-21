import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDevices, getDeviceStats } from '@/api/devices';
import type { DeviceDTO } from '@/types/device';
import EntityTable, { ColumnDef } from '@/components/common/EntityTable';
import StatusBadge from '@/components/common/StatusBadge';
import RiskBadge from '@/components/common/RiskBadge';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import KpiBar from '@/components/common/KpiBar';
import { useSelectionStore } from '@/stores/selectionStore';
import { useUIStore } from '@/stores/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { SIM_TYPE_LABELS } from '@/utils/constants';
import { maskPhone, formatDate } from '@/utils/formatters';

/** 设备列表筛选字段选项 */
const STATUS_OPTIONS = [
  { value: '启用中', label: '启用中' },
  { value: '闲置', label: '闲置' },
  { value: '已注销', label: '已注销' },
];

const SIM_OPTIONS = [
  { value: 'single', label: '单卡' },
  { value: 'dual', label: '双卡' },
];

const RISK_OPTIONS = [
  { value: 'high', label: '高风险' },
  { value: 'medium', label: '中风险' },
  { value: 'low', label: '低风险' },
  { value: 'none', label: '正常' },
];

interface DeviceListViewProps {
  /** 外部搜索关键词（从全局搜索传入） */
  searchKeyword?: string;
  onSearchChange?: (keyword: string) => void;
}

/**
 * 设备列表视图
 * KpiBar + SearchBar + FilterBar + EntityTable + BatchActionBar
 */
const DeviceListView: React.FC<DeviceListViewProps> = ({ searchKeyword, onSearchChange }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState(searchKeyword || '');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const debouncedSearch = useDebounce(search, 300);
  const debouncedFilters = useDebounce(filters, 200);

  const { setSelection } = useSelectionStore();
  const { openPanel } = useUIStore();

  // 设备列表查询
  const { data: deviceRes, isLoading } = useQuery({
    queryKey: ['devices', page, pageSize, debouncedSearch, sortBy, sortOrder, debouncedFilters],
    queryFn: () =>
      getDevices({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        status: debouncedFilters.status || undefined,
        risk_level: debouncedFilters.risk_level || undefined,
        sim_type: debouncedFilters.sim_type || undefined,
      }),
  });

  // KPI 统计查询
  const { data: statsRes } = useQuery({
    queryKey: ['device-stats'],
    queryFn: () => getDeviceStats(),
  });

  const devices = deviceRes?.data || [];
  const pagination = deviceRes?.pagination;
  const stats = statsRes?.data;

  const columns: ColumnDef<DeviceDTO>[] = [
    { key: 'device_code', label: '设备编号', width: 160, sortable: true },
    { key: 'device_name', label: '设备名称', width: 160, sortable: true },
    { key: 'brand_model', label: '品牌型号', width: 140 },
    { key: 'imei', label: 'IMEI', width: 150 },
    {
      key: 'sim_type',
      label: 'SIM 类型',
      width: 80,
      render: (val) => <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, backgroundColor: '#F3F4F6', color: '#374151' }}>{SIM_TYPE_LABELS[val as keyof typeof SIM_TYPE_LABELS] || val}</span>,
    },
    {
      key: 'phone_number_sim1',
      label: '卡槽1 手机号',
      width: 130,
      render: (_val, row) => {
        const sim1 = (row as any).phone_numbers?.find((p: any) => p.slot_type === 'sim1');
        return <span>{sim1 ? maskPhone(sim1.phone_number) : '-'}</span>;
      },
    },
    {
      key: 'phone_number_sim2',
      label: '卡槽2 手机号',
      width: 130,
      render: (_val, row) => {
        const sim2 = (row as any).phone_numbers?.find((p: any) => p.slot_type === 'sim2');
        if ((row as any).sim_type === 'single') return <span style={{ color: '#D1D5DB' }}>-</span>;
        return <span>{sim2 ? maskPhone(sim2.phone_number) : '-'}</span>;
      },
    },
    {
      key: 'account_count',
      label: '绑定账号数',
      width: 100,
      render: (_val, row) => {
        const count = ((row as any).phone_numbers || []).reduce((sum: number, p: any) => sum + (p.internet_accounts?.length || 0), 0);
        return <span style={{ fontWeight: 500 }}>{count}</span>;
      },
    },
    { key: 'department_name', label: '所属部门', width: 100, render: (val) => val || '-' },
    { key: 'owner_name', label: '负责人', width: 90, render: (val) => val || '-' },
    { key: 'current_user_name', label: '当前使用人', width: 90, render: (val) => val || '-' },
    {
      key: 'status',
      label: '设备状态',
      width: 90,
      render: (val) => <StatusBadge status={val as string} />,
    },
    {
      key: 'risk_level',
      label: '风险等级',
      width: 80,
      render: (val) => <RiskBadge level={val as string} />,
    },
    {
      key: 'updated_at',
      label: '更新时间',
      width: 150,
      sortable: true,
      render: (val) => formatDate(val as string),
    },
  ];

  const filterFields = [
    { key: 'sim_type', label: 'SIM 类型', options: SIM_OPTIONS, width: 120 },
    { key: 'status', label: '状态', options: STATUS_OPTIONS, width: 120 },
    { key: 'risk_level', label: '风险等级', options: RISK_OPTIONS, width: 130 },
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (row: DeviceDTO) => {
    setSelection('device', row.id, row as unknown as Record<string, unknown>, row.device_name);
    openPanel();
  };

  return (
    <div>
      {/* KPI 统计 */}
      <KpiBar stats={stats} loading={isLoading} viewType="device" />

      {/* 搜索与筛选 */}
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

      {/* 表格 */}
      <EntityTable
        columns={columns}
        data={devices}
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
        selectable={false}
        emptyMessage="暂无设备数据"
      />
    </div>
  );
};

export default DeviceListView;
