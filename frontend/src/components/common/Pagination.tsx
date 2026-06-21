import React from 'react';
import type { PaginationMeta } from '@/types/api';
import { formatPaginationInfo } from '@/utils/formatters';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

/**
 * 分页组件
 * 显示当前页/总页数、条数信息，上一页/下一页按钮
 */
const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
}) => {
  const { page, pageSize, total } = pagination;
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      {/* 左侧：条数信息 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#6B7280' }}>
        <span>{formatPaginationInfo(page, pageSize, total)}</span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>每页</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '2px 8px',
                fontSize: 13,
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                backgroundColor: 'white',
                color: '#374151',
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} 条
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 右侧：分页按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <PageButton
          label="上一页"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />

        {generatePageNumbers(page, totalPages).map((p, index) => {
          if (p === 'ellipsis') {
            return <span key={`e-${index}`} style={{ padding: '0 4px', color: '#9CA3AF' }}>...</span>;
          }
          const pageNum = p as number;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: 32,
                height: 32,
                borderRadius: 6,
                border: pageNum === page ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: pageNum === page ? 'var(--color-primary-bg)' : 'white',
                color: pageNum === page ? 'var(--color-primary)' : '#374151',
                fontSize: 13,
                fontWeight: pageNum === page ? 600 : 400,
                cursor: 'pointer',
                padding: '0 8px',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        <PageButton
          label="下一页"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </div>
  );
};

/** 分页按钮 */
const PageButton: React.FC<{ label: string; disabled: boolean; onClick: () => void }> = ({
  label,
  disabled,
  onClick,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      padding: '4px 12px',
      fontSize: 13,
      border: '1px solid var(--color-border)',
      borderRadius: 6,
      backgroundColor: disabled ? '#F9FAFB' : 'white',
      color: disabled ? '#D1D5DB' : '#374151',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
  >
    {label}
  </button>
);

/** 生成显示的页码列表 */
function generatePageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  if (current <= 4) {
    // 靠近开头
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(total);
  } else if (current >= total - 3) {
    // 靠近结尾
    pages.push(1);
    pages.push('ellipsis');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    // 中间
    pages.push(1);
    pages.push('ellipsis');
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push('ellipsis');
    pages.push(total);
  }

  return pages;
}

export default Pagination;
