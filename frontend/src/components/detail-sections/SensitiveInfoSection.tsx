import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IconButton, Tooltip, Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { viewSensitive, updateSensitive } from '@/api/sensitive';
import SensitiveField from '@/components/common/SensitiveField';
import { useUIStore } from '@/stores/uiStore';
import { usePermission } from '@/hooks/usePermission';

interface SensitiveInfoSectionProps {
  /** 账号 ID */
  accountId: number;
  /** 密码更新时间 */
  passwordUpdatedAt?: string | null;
  /** 是否设置了密码 */
  hasPassword?: boolean;
  /** 是否设置了实名信息 */
  hasRealName?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 编辑回调（可选的编辑模式） */
  onEdit?: () => void;
}

/**
 * 敏感信息区块（完整版）
 *
 * 集成到 AccountDetail 中：
 * - 显示：登录密码、实名信息、备份信息
 * - 每个字段使用 SensitiveField 组件
 * - 顶部标题 + 上次密码更新时间
 * - 编辑按钮（修改敏感信息 → PUT API）
 */
const SensitiveInfoSection: React.FC<SensitiveInfoSectionProps> = ({
  accountId,
  passwordUpdatedAt,
  hasPassword = false,
  hasRealName = false,
  loading = false,
  onEdit,
}) => {
  const { canViewSensitive, canEdit } = usePermission();
  const { showToast } = useUIStore();
  const [infoLoaded, setInfoLoaded] = useState(false);

  // 组件挂载时验证是否有敏感信息可展示
  useEffect(() => {
    // 只是确认有数据，实际数据由 SensitiveField 各自加载
    setInfoLoaded(true);
  }, []);

  // 格式化密码更新时间
  const formatPwdTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <Section title="敏感信息">
        <div style={{ padding: '8px 0', color: '#9CA3AF', fontSize: 13 }}>加载中...</div>
      </Section>
    );
  }

  const formattedPwdTime = formatPwdTime(passwordUpdatedAt);

  return (
    <Section title="敏感信息">
      {/* 密码更新时间 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        {formattedPwdTime && (
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
            上次密码更新: {formattedPwdTime}
          </div>
        )}
        {canEdit && onEdit && (
          <Button
            size="small"
            variant="text"
            startIcon={<Edit fontSize="small" />}
            onClick={onEdit}
            sx={{ fontSize: 12, textTransform: 'none', color: '#6B7280', minWidth: 'auto' }}
          >
            编辑
          </Button>
        )}
      </div>

      {/* 登录密码 */}
      <SensitiveField
        accountId={accountId}
        field="login_password"
        label="登录密码"
        canView={canViewSensitive}
      />

      {/* 实名信息 */}
      <SensitiveField
        accountId={accountId}
        field="real_name_info"
        label="实名信息"
        canView={canViewSensitive}
      />

      {/* 备份信息 */}
      <SensitiveField
        accountId={accountId}
        field="backup_info"
        label="备份信息"
        canView={canViewSensitive}
      />
    </Section>
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

export default SensitiveInfoSection;
