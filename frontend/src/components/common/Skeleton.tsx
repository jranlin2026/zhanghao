import React from 'react';

interface SkeletonProps {
  /** 骨架屏宽度 */
  width?: string | number;
  /** 骨架屏高度 */
  height?: string | number;
  /** 圆角 */
  borderRadius?: string | number;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 单行骨架屏
 */
const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, borderRadius = 4, style }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#F3F4F6',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
      className="skeleton-pulse"
    />
  );
};

/**
 * 表格骨架屏
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  return (
    <div style={{ padding: '16px 0' }}>
      {/* 表头 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, padding: '0 16px' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} width={`${Math.floor(100 / columns)}%`} height={32} />
        ))}
      </div>
      {/* 数据行 */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`row-${r}`} style={{ display: 'flex', gap: 16, marginBottom: 8, padding: '0 16px' }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={`cell-${r}-${c}`}
              width={`${Math.floor(100 / columns)}%`}
              height={24}
            />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

/**
 * 卡片骨架屏
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <Skeleton width="60%" height={20} style={{ marginBottom: 16 }} />
      <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="50%" height={14} />
    </div>
  );
};

/**
 * 详情面板骨架屏
 */
export const DetailSkeleton: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Skeleton width="70%" height={24} style={{ marginBottom: 24 }} />
      <Skeleton width="40%" height={16} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={60} height={24} borderRadius={12} />
      </div>
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginBottom: 16 }}>
        <Skeleton width="100%" height={14} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: 12 }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: 12 }} />
      </div>
      <Skeleton width="100%" height={100} borderRadius={8} />
    </div>
  );
};

export default Skeleton;
