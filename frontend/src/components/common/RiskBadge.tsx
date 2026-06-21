import React from 'react';
import type { RiskLevel } from '@/utils/constants';

interface RiskBadgeProps {
  level: RiskLevel | string;
}

const riskConfig: Record<string, { bg: string; color: string; label: string }> = {
  high: { bg: '#FEF2F2', color: '#DC2626', label: '高风险' },
  medium: { bg: '#FFFBEB', color: '#D97706', label: '中风险' },
  low: { bg: '#FFF7ED', color: '#EA580C', label: '低风险' },
  none: { bg: '#F3F4F6', color: '#6B7280', label: '正常' },
};

/**
 * 风险等级标签组件
 * high=红底红字 / medium=黄底橙字 / low=橙底橙字 / none=灰底灰字
 */
const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const config = riskConfig[level] || riskConfig.none;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        fontSize: 12,
        lineHeight: '20px',
        fontWeight: 500,
        borderRadius: 4,
        backgroundColor: config.bg,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
};

export default RiskBadge;
