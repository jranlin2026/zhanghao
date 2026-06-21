import React, { useEffect, useState } from 'react';
import { getAccountById } from '@/api/accounts';
import { viewSensitive } from '@/api/sensitive';
import type { InternetAccountDTO, SensitiveInfoDTO } from '@/types/account';
import StatusBadge from '@/components/common/StatusBadge';
import RiskBadge from '@/components/common/RiskBadge';
import { DetailSkeleton } from '@/components/common/Skeleton';
import { formatDate, formatMoney, maskPhone } from '@/utils/formatters';
import { usePermission } from '@/hooks/usePermission';
import SensitiveInfoSection from './SensitiveInfoSection';
import { PERMISSION_STATUS_COLORS } from '@/utils/constants';

interface AccountDetailProps {
  accountId: number;
}

/**
 * 互联网账号详情区块
 * 展示账号摘要、绑定关系、责任信息、敏感信息、费用与期限、风险与建议
 */
const AccountDetail: React.FC<AccountDetailProps> = ({ accountId }) => {
  const [account, setAccount] = useState<InternetAccountDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensitiveInfo, setSensitiveInfo] = useState<SensitiveInfoDTO | null>(null);
  const { canViewSensitive } = usePermission();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAccountById(accountId)
      .then((res) => {
        if (!cancelled) {
          const data = res.data as any;
          setAccount(data as unknown as InternetAccountDTO);
          // 如果已有加密数据信息，填充到敏感信息状态
          if (data.sensitiveInfo) {
            setSensitiveInfo({
              id: data.sensitiveInfo.id,
              account_id: accountId,
              login_password: null,
              real_name_info: null,
              password_updated_at: data.sensitiveInfo.passwordUpdatedAt || data.sensitiveInfo.password_updated_at,
              has_password: !!data.sensitiveInfo.loginPasswordEncrypted || !!data.sensitiveInfo.login_password_encrypted,
              has_real_name: !!data.sensitiveInfo.realNameInfoEncrypted || !!data.sensitiveInfo.real_name_info_encrypted,
            });
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [accountId]);

  if (loading) return <DetailSkeleton />;
  if (error) return <div style={{ padding: 24, color: '#DC2626', fontSize: 14 }}>加载失败: {error}</div>;
  if (!account) return <div style={{ padding: 24, color: '#9CA3AF', fontSize: 14 }}>账号不存在</div>;

  const permColor = PERMISSION_STATUS_COLORS[account.permission_status as keyof typeof PERMISSION_STATUS_COLORS] || '#6B7280';

  return (
    <div style={{ padding: 20 }}>
      {/* 账号摘要 */}
      <Section title="账号摘要">
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>
          {account.account_name}
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
          {account.account_code} · {account.platform}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <StatusBadge status={account.status} />
          <RiskBadge level={account.risk_level} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 4,
              backgroundColor: `${permColor}15`,
              color: permColor,
            }}
          >
            {account.permission_status}
          </span>
        </div>
      </Section>

      {/* 绑定关系 */}
      <Section title="绑定关系">
        <DetailRow label="绑定手机号" value={account.bind_phone ? maskPhone(account.bind_phone) : '-'} />
        <DetailRow label="绑定邮箱" value={account.bind_email || '-'} />
        <DetailRow label="登录账号" value={account.login_account} />
      </Section>

      {/* 责任信息 */}
      <Section title="责任信息">
        <DetailRow label="所属主体" value={account.owner_subject} />
        <DetailRow label="所属部门" value={account.department_name || '-'} />
        <DetailRow label="负责人" value={account.owner_name || '-'} />
        <DetailRow label="当前使用人" value={account.current_user_name || '-'} />
      </Section>

      {/* 敏感信息 — 使用完整版的 SensitiveInfoSection */}
      <SensitiveInfoSection
        accountId={accountId}
        passwordUpdatedAt={sensitiveInfo?.password_updated_at}
        hasPassword={sensitiveInfo?.has_password || false}
        hasRealName={sensitiveInfo?.has_real_name || false}
      />

      {/* 费用与期限 */}
      <Section title="费用与期限">
        <DetailRow label="服务商" value={account.purpose || '-'} />
        <DetailRow label="月费用" value={formatMoney(account.monthly_fee)} />
        <DetailRow label="到期时间" value={account.expire_at ? formatDate(account.expire_at) : '-'} />
      </Section>

      {/* 用途 */}
      {account.purpose && (
        <Section title="用途">
          <div style={{ fontSize: 13, color: '#6B7280' }}>{account.purpose}</div>
        </Section>
      )}

      {/* 备注 */}
      {account.remark && (
        <Section title="备注">
          <div style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'pre-wrap' }}>{account.remark}</div>
        </Section>
      )}

      {/* 更新时间 */}
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
        更新于 {formatDate(account.updated_at)}
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

export default AccountDetail;
