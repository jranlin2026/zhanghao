import React, { useEffect, useState } from 'react';
import { getPhoneById } from '@/api/phones';
import type { PhoneNumberDTO } from '@/types/phone';
import StatusBadge from '@/components/common/StatusBadge';
import { DetailSkeleton } from '@/components/common/Skeleton';
import { formatDate, maskPhone, formatMoney } from '@/utils/formatters';
import { SLOT_TYPE_LABELS } from '@/utils/constants';

interface PhoneDetailProps {
  phoneId: number;
}

/**
 * 手机号详情区块
 * 展示手机号摘要、属性、绑定的互联网账号列表
 */
const PhoneDetail: React.FC<PhoneDetailProps> = ({ phoneId }) => {
  const [phone, setPhone] = useState<PhoneNumberDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPhoneById(phoneId)
      .then((res) => {
        if (!cancelled) {
          setPhone(res.data as unknown as PhoneNumberDTO);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [phoneId]);

  if (loading) return <DetailSkeleton />;
  if (error) return <div style={{ padding: 24, color: '#DC2626', fontSize: 14 }}>加载失败: {error}</div>;
  if (!phone) return <div style={{ padding: 24, color: '#9CA3AF', fontSize: 14 }}>手机号不存在</div>;

  const accounts = phone.internet_accounts || [];

  return (
    <div style={{ padding: 20 }}>
      {/* 手机号摘要 */}
      <Section title="手机号摘要">
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1F2937', marginBottom: 8 }}>
          {maskPhone(phone.phone_number)}
        </div>
        <DetailRow label="运营商" value={phone.carrier} />
        <DetailRow label="所属设备" value={phone.device_name || '-'} />
        <DetailRow label="卡槽" value={SLOT_TYPE_LABELS[phone.slot_type] || phone.slot_type} />
        <div style={{ marginTop: 8 }}>
          <StatusBadge status={phone.status} />
        </div>
      </Section>

      {/* 手机号属性 */}
      <Section title="手机号属性">
        <DetailRow label="负责人" value={phone.owner_name || '-'} />
        <DetailRow label="是否主用" value={phone.is_primary ? '是' : '否'} />
        <DetailRow label="套餐类型" value={phone.plan_type || '-'} />
        <DetailRow label="月费用" value={formatMoney(phone.monthly_fee)} />
      </Section>

      {/* 绑定的互联网账号 */}
      <Section title={`绑定的互联网账号 (${accounts.length})`}>
        {accounts.length === 0 ? (
          <div style={{ fontSize: 13, color: '#9CA3AF', padding: '8px 0' }}>暂无绑定账号</div>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>
                  {acc.account_name}
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{acc.platform}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <StatusBadge status={acc.status} />
                <span
                  style={{
                    fontSize: 11,
                    color: acc.risk_level === 'high' ? '#DC2626' : acc.risk_level === 'medium' ? '#D97706' : '#6B7280',
                    fontWeight: 500,
                  }}
                >
                  {acc.risk_level === 'high' ? '高风险' : acc.risk_level === 'medium' ? '中风险' : acc.risk_level === 'low' ? '低风险' : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </Section>

      {/* 备注 */}
      {phone.remark && (
        <Section title="备注">
          <div style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'pre-wrap' }}>{phone.remark}</div>
        </Section>
      )}

      {/* 更新时间 */}
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
        更新于 {formatDate(phone.updated_at)}
      </div>
    </div>
  );
};

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

export default PhoneDetail;
