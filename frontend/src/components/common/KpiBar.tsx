import React from 'react';
import type { DeviceStats } from '@/types/device';

interface KpiBarProps {
  /** 设备 KPI 统计数据 */
  stats?: DeviceStats;
  /** 是否加载中 */
  loading?: boolean;
  /** 视图类型 */
  viewType?: 'device' | 'phone' | 'account';
  /** 自定义统计项 */
  items?: KpiItem[];
}

interface KpiItem {
  label: string;
  value: number;
  color?: string;
  bgColor?: string;
}

const defaultColors = {
  value: '#1F2937',
  bg: '#F3F4F6',
};

/**
 * KPI 指标条
 * 显示 4-5 个统计卡片
 * 设备视图显示：总数、启用中、闲置、高风险、无负责人
 */
const KpiBar: React.FC<KpiBarProps> = ({ stats, loading, viewType = 'device', items }) => {
  const kpiItems: KpiItem[] = items || getDefaultItems(stats, viewType);

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginBottom: 8,
      }}
    >
      {kpiItems.map((item, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: item.bgColor || defaultColors.bg,
            border: `1px solid ${item.bgColor || '#F3F4F6'}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: '#6B7280',
              fontWeight: 500,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: item.color || defaultColors.value,
              lineHeight: 1.2,
            }}
          >
            {loading ? '-' : item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

function getDefaultItems(stats?: DeviceStats, viewType?: string): KpiItem[] {
  if (!stats) {
    return [
      { label: '设备总数', value: 0 },
      { label: '启用中', value: 0 },
      { label: '闲置', value: 0 },
      { label: '高风险', value: 0, color: '#DC2626', bgColor: '#FEF2F2' },
      { label: '无负责人', value: 0, color: '#D97706', bgColor: '#FFFBEB' },
    ];
  }

  return [
    { label: '设备总数', value: stats.total },
    { label: '启用中', value: stats.active, color: '#059669', bgColor: '#ECFDF5' },
    { label: '闲置', value: stats.idle, color: '#6B7280', bgColor: '#F3F4F6' },
    { label: '高风险', value: stats.highRisk, color: '#DC2626', bgColor: '#FEF2F2' },
    { label: '无负责人', value: stats.noOwner, color: '#D97706', bgColor: '#FFFBEB' },
  ];
}

export default KpiBar;
