import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPhones } from '@/api/phones';
import type { PhoneNumberDTO } from '@/types/phone';
import EntityTable, { ColumnDef } from '@/components/common/EntityTable';
import StatusBadge from '@/components/common/StatusBadge';
import SearchBar from '@/components/common/SearchBar';
import FilterBar from '@/components/common/FilterBar';
import { useSelectionStore } from '@/stores/selectionStore';
import { useUIStore } from '@/stores/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { SLOT_TYPE_LABELS, CARRIERS } from '@/utils/constants';
import { maskPhone, formatMoney, formatDate } from '@/utils/formatters';

const STATUS_OPTIONS = [
  { value: '启用中', label: '启用中' },
  { value: '闲置', label: '闲置' },
  { value: '已注销', label: '已注销' },
];

const CARRIER_OPTIONS = CARRIERS.map((c) => ({ value: c, label: c }));

const SLOT_OPTIONS = [
  { value: 'sim1', label: 'SIM卡槽1' },
  { value: 'sim2', label: 'SIM卡槽2' },
];

interface PhoneListViewProps {
  searchKeyword?: string;
  onSearchChange?: (keyword: string) => void;
}

/**
 * 手机号列表视图
 * 跨设备展示所有手机号
 */
const PhoneListView: React.FC<PhoneListViewProps> = ({ searchKeyword, onSearchChange }) => {
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
  const { openPanel } = useUIStore();

  const { data: phoneRes, isLoading } = useQuery({
    queryKey: ['phones', page, pageSize, debouncedSearch, sortBy, sortOrder, debouncedFilters],
    queryFn: () =>
      getPhones({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        status: debouncedFilters.status || undefined,
        carrier: debouncedFilters.carrier || undefined,
        slot_type: debouncedFilters.slot_type || undefined,
      }),
  });

  const phones = phoneRes?.data || [];
  const pagination = phoneRes?.pagination;

  const columns: ColumnDef<PhoneNumberDTO>[] = [
    { key: 'phone_number', label: '手机号', width: 130, render: (val) => maskPhone(val as string) },
    { key: 'carrier', label: '运营商', width: 110 },
    { key: 'device_name', label: '所属设备', width: 150, render: (val) => val || '-' },
    { key: 'slot_type', label: 'SIM 卡槽', width: 90, render: (val) => SLOT_TYPE_LABELS[val as keyof typeof SLOT_TYPE_LABELS] || val },
    {
      key: 'account_count',
      label: '绑定账号数',
      width: 100,
      render: (_val, row) => {
        const count = (row as any).internet_accounts?.length || (row as any)._count?.internet_accounts || 0;
        return <span style={{ fontWeight: 500 }}>{count}</span>;
      },
    },
    { key: 'owner_name', label: '负责人', width: 90, render: (val) => val || '-' },
    { key: 'monthly_fee', label: '月费用', width: 90, render: (val) => formatMoney(val as number) },
    { key: 'status', label: '状态', width: 80, render: (val) => <StatusBadge status={val as string} /> },
    {
      key: 'updated_at',
      label: '更新时间',
      width: 150,
      sortable: true,
      render: (val) => formatDate(val as string),
    },
  ];

  const filterFields = [
    { key: 'slot_type', label: '卡槽', options: SLOT_OPTIONS, width: 120 },
    { key: 'carrier', label: '运营商', options: CARRIER_OPTIONS, width: 120 },
    { key: 'status', label: '状态', options: STATUS_OPTIONS, width: 120 },
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (row: PhoneNumberDTO) => {
    setSelection('phone', row.id, row as unknown as Record<string, unknown>, row.phone_number);
    openPanel();
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

      {/* 表格 */}
      <EntityTable
        columns={columns}
        data={phones}
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
        emptyMessage="暂无手机号数据"
      />
    </div>
  );
};

export default PhoneListView;
