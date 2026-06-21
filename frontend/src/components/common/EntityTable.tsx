import React from 'react';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import type { PaginationMeta } from '@/types/api';
import Pagination from './Pagination';
import { TableSkeleton } from './Skeleton';

/** 列定义 */
export interface ColumnDef<T = Record<string, unknown>> {
  key: string;
  label: string;
  width?: number | string;
  minWidth?: number;
  sortable?: boolean;
  /** 自定义渲染 */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** 固定列 */
  fixed?: 'left' | 'right';
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
}

interface EntityTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  /** 行 key（默认取 id） */
  rowKey?: keyof T | ((row: T) => string | number);
  /** 选中行 ID 列表 */
  selectedIds?: number[];
  /** 选择变更 */
  onSelectionChange?: (ids: number[]) => void;
  /** 行点击 */
  onRowClick?: (row: T) => void;
  /** 当前排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 排序变更 */
  onSort?: (field: string) => void;
  /** 分页信息 */
  pagination?: PaginationMeta;
  /** 分页变更 */
  onPageChange?: (page: number) => void;
  /** 每页条数变更 */
  onPageSizeChange?: (pageSize: number) => void;
  /** 是否可选择 */
  selectable?: boolean;
  /** 空数据提示 */
  emptyMessage?: string;
  /** 表格容器最大高度 */
  maxHeight?: number | string;
  /** 行样式 */
  rowStyle?: (row: T) => React.CSSProperties | undefined;
}

/**
 * 通用表格组件
 * 固定表头 + 首列固定 + 多选 + 排序 + 分页 + 横向滚动
 * 不使用斑马行；红色仅用于高风险标识
 */
function EntityTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  rowKey = 'id' as keyof T,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  selectable = false,
  emptyMessage = '暂无数据',
  maxHeight,
  rowStyle,
}: EntityTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const getRowKey = (row: T): string | number => {
    if (typeof rowKey === 'function') return rowKey(row);
    return (row[rowKey] as string | number) ?? JSON.stringify(row);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      const allIds = data.map((row) => Number(row.id ?? getRowKey(row)));
      onSelectionChange(allIds);
    }
  };

  const handleSelectRow = (id: number) => {
    if (!onSelectionChange) return;
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelected);
  };

  const handleSort = (field: string) => {
    if (onSort) onSort(field);
  };

  return (
    <div>
      <TableContainer
        sx={{
          maxHeight: maxHeight || 'calc(100vh - 340px)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{ minWidth: columns.reduce((sum, c) => sum + (typeof c.width === 'number' ? c.width : 120), 0) }}
        >
          {/* 表头 */}
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    backgroundColor: '#F9FAFB',
                    borderBottom: '1px solid var(--color-border)',
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                  }}
                >
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{
                    backgroundColor: '#F9FAFB',
                    color: '#6B7280',
                    fontWeight: 600,
                    fontSize: 12,
                    borderBottom: '1px solid var(--color-border)',
                    whiteSpace: 'nowrap',
                    padding: '8px 12px',
                    minWidth: col.minWidth,
                    width: col.width,
                    ...(col.fixed === 'left'
                      ? {
                          position: 'sticky',
                          left: selectable ? 42 : 0,
                          zIndex: 3,
                        }
                      : col.fixed === 'right'
                      ? {
                          position: 'sticky',
                          right: 0,
                          zIndex: 3,
                        }
                      : {}),
                  }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortOrder : 'asc'}
                      onClick={() => handleSort(col.key)}
                      sx={{ color: '#6B7280 !important', '&.Mui-active': { color: '#1F2937 !important' } }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* 表体 */}
          <TableBody>
            {loading && data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={{ padding: 0, border: 'none' }}
                >
                  <TableSkeleton rows={5} columns={columns.length} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  sx={{
                    padding: '48px 16px',
                    color: '#9CA3AF',
                    fontSize: 14,
                    borderBottom: 'none',
                  }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = Number(row.id ?? getRowKey(row));
                const isSelected = selectedIds.includes(rowId);
                const customStyle = rowStyle ? rowStyle(row) : undefined;

                return (
                  <TableRow
                    key={rowId}
                    hover
                    selected={isSelected}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': { backgroundColor: '#F9FAFB' },
                      '&.Mui-selected': { backgroundColor: 'var(--color-primary-bg) !important' },
                      ...customStyle,
                    }}
                  >
                    {selectable && (
                      <TableCell
                        padding="checkbox"
                        sx={{
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'white',
                          zIndex: 2,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          size="small"
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => {
                      const value = row[col.key];
                      return (
                        <TableCell
                          key={col.key}
                          align={col.align || 'left'}
                          sx={{
                            fontSize: 13,
                            color: '#374151',
                            padding: '6px 12px',
                            borderBottom: '1px solid #F3F4F6',
                            whiteSpace: 'nowrap',
                            ...(col.fixed === 'left'
                              ? {
                                  position: 'sticky',
                                  left: selectable ? 42 : 0,
                                  backgroundColor: 'white',
                                  zIndex: 2,
                                }
                              : col.fixed === 'right'
                              ? {
                                  position: 'sticky',
                                  right: 0,
                                  backgroundColor: 'white',
                                  zIndex: 2,
                                }
                              : {}),
                          }}
                        >
                          {col.render ? col.render(value, row) : (value as React.ReactNode) ?? '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页 */}
      {pagination && onPageChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}

export default EntityTable;
