import React, { useEffect, useState } from 'react';
import { getDeviceById } from '@/api/devices';
import type { DeviceDTO } from '@/types/device';
import StatusBadge from '@/components/common/StatusBadge';
import RiskBadge from '@/components/common/RiskBadge';
import { DetailSkeleton } from '@/components/common/Skeleton';
import { formatDate, maskPhone } from '@/utils/formatters';
import { SIM_TYPE_LABELS, ENTITY_TYPE_LABELS } from '@/utils/constants';

interface DeviceDetailProps {
  deviceId: number;
}

/**
 * 设备详情区块
 * 展示设备摘要、属性、SIM卡槽信息、绑定账号汇总、风险与建议
 */
const DeviceDetail: React.FC<DeviceDetailProps> = ({ deviceId }) => {
  const [device, setDevice] = useState<DeviceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDeviceById(deviceId)
      .then((res) => {
        if (!cancelled) {
          setDevice(res.data as unknown as DeviceDTO);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || '加载失败');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [deviceId]);

  if (loading) return <DetailSkeleton />;
  if (error) return <div style={{ padding: 24, color: '#DC2626', fontSize: 14 }}>加载失败: {error}</div>;
  if (!device) return <div style={{ padding: 24, color: '#9CA3AF', fontSize: 14 }}>设备不存在</div>;

  // 统计绑定账号数
  const totalAccounts = (device.phone_numbers || []).reduce((sum, phone) => {
    return sum + (phone.internet_accounts?.length || 0);
  }, 0);

  return (
    <div style={{ padding: 20 }}>
      {/* 设备摘要 */}
      <Section title="设备摘要">
        <DetailRow label="设备名称" value={device.device_name} />
        <DetailRow label="设备编号" value={device.device_code} />
        <DetailRow label="品牌型号" value={device.brand_model} />
        <DetailRow label="IMEI" value={device.imei} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <StatusBadge status={device.status} />
          <RiskBadge level={device.risk_level} />
        </div>
      </Section>

      {/* 设备属性 */}
      <Section title="设备属性">
        <DetailRow label="所属主体" value={device.owner_subject} />
        <DetailRow label="所属部门" value={device.department_name || '-'} />
        <DetailRow label="负责人" value={device.owner_name || '-'} />
        <DetailRow label="当前使用人" value={device.current_user_name || '-'} />
        <DetailRow label="SIM 类型" value={SIM_TYPE_LABELS[device.sim_type] || device.sim_type} />
      </Section>

      {/* SIM 卡槽信息 */}
      <Section title="SIM 卡槽信息">
        {(device.phone_numbers || []).length === 0 ? (
          <div style={{ fontSize: 13, color: '#9CA3AF', padding: '8px 0' }}>暂无绑定手机号</div>
        ) : (
          device.phone_numbers?.map((phone) => (
            <div
              key={phone.id}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #F3F4F6',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6B7280', fontSize: 12 }}>
                  {phone.slot_type === 'sim1' ? 'SIM卡槽1' : 'SIM卡槽2'}
                </span>
                <StatusBadge status={phone.status} />
              </div>
              <div style={{ color: '#1F2937', fontWeight: 500 }}>
                {maskPhone(phone.phone_number)}
              </div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>
                {phone.carrier} · {phone.monthly_fee ? `¥${phone.monthly_fee}/月` : '无月费'}
              </div>
            </div>
          ))
        )}
      </Section>

      {/* 绑定账号汇总 */}
      <Section title="绑定账号汇总">
        {totalAccounts === 0 ? (
          <div style={{ fontSize: 13, color: '#9CA3AF', padding: '8px 0' }}>暂无绑定互联网账号</div>
        ) : (
          device.phone_numbers?.map((phone) => {
            const accounts = phone.internet_accounts || [];
            if (accounts.length === 0) return null;
            return (
              <div key={phone.id} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                  {maskPhone(phone.phone_number)} 绑定的账号 ({accounts.length})
                </div>
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      marginBottom: 4,
                      borderRadius: 4,
                      backgroundColor: '#F9FAFB',
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <span style={{ color: '#1F2937', fontWeight: 500 }}>{acc.account_name}</span>
                      <span style={{ color: '#9CA3AF', marginLeft: 6, fontSize: 12 }}>{acc.platform}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <StatusBadge status={acc.status} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </Section>

      {/* 备注 */}
      {device.remark && (
        <Section title="备注">
          <div style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'pre-wrap' }}>{device.remark}</div>
        </Section>
      )}

      {/* 更新时间 */}
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
        更新于 {formatDate(device.updated_at)}
      </div>
    </div>
  );
};

/** 区块容器 */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

/** 详情行 */
const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 0',
      fontSize: 13,
    }}
  >
    <span style={{ color: '#6B7280' }}>{label}</span>
    <span style={{ color: '#1F2937', fontWeight: 500, textAlign: 'right', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {value}
    </span>
  </div>
);

export default DeviceDetail;
