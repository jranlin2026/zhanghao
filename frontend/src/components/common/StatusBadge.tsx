import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'device' | 'phone' | 'account';
}

const statusConfig: Record<string, { bg: string; color: string; border?: string }> = {
  '启用中': { bg: '#EFF6FF', color: '#2563EB' },
  '正常': { bg: '#EFF6FF', color: '#2563EB' },
  '使用中': { bg: '#ECFDF5', color: '#059669' },
  '闲置': { bg: '#F3F4F6', color: '#6B7280' },
  '冻结': { bg: '#FEF3C7', color: '#D97706' },
  '异常': { bg: '#FEF2F2', color: '#DC2626' },
  '已注销': { bg: 'transparent', color: '#9CA3AF', border: '#D1D5DB' },
  '已收回': { bg: '#F3F4F6', color: '#6B7280' },
};

/**
 * 状态标签组件
 * 启用中=蓝色，闲置=灰色，已注销=红色空心边框，异常=红色实心
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const config = statusConfig[status] || { bg: '#F3F4F6', color: '#6B7280' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        fontSize: 12,
        lineHeight: '20px',
        fontWeight: 500,
        borderRadius: 4,
        backgroundColor: config.bg,
        color: config.color,
        border: config.border ? `1px solid ${config.border}` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: config.color,
          opacity: status === '已注销' ? 0.5 : 1,
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
