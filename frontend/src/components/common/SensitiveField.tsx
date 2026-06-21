import React, { useState, useCallback } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Visibility, ContentCopy, CheckCircle } from '@mui/icons-material';
import { viewSensitive, copySensitiveField } from '@/api/sensitive';
import { useSensitiveTimer } from '@/hooks/useSensitiveTimer';
import { useUIStore } from '@/stores/uiStore';

interface SensitiveFieldProps {
  /** 账号 ID */
  accountId: number;
  /** 敏感字段名：login_password | real_name_info | backup_info */
  field: 'login_password' | 'real_name_info' | 'backup_info';
  /** 字段显示名 */
  label: string;
  /** 是否有查看权限 */
  canView: boolean;
}

/**
 * 敏感信息脱敏组件
 *
 * 行为：
 * 1. 默认显示 `••••••`（灰底灰字）
 * 2. 点击「查看」按钮 → 调用 GET /api/internet-accounts/:id/sensitive
 * 3. 成功后显示明文 + "已记录审计日志"图标
 * 4. 点击「复制」按钮 → 调用 POST /api/internet-accounts/:id/sensitive/copy
 * 5. 复制成功后 Toast "已复制到剪贴板"
 * 6. 30 秒后自动恢复 `••••••`
 * 7. 无权限时按钮灰色不可点击 + tooltip "暂无权限查看敏感信息"
 */
const SensitiveField: React.FC<SensitiveFieldProps> = ({ accountId, field, label, canView }) => {
  const [plainText, setPlainText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [auditLogged, setAuditLogged] = useState(false);
  const { showToast } = useUIStore();
  const { isMasked, startTimer, resetTimer, timeLeft } = useSensitiveTimer(true);

  /** 查看敏感信息 */
  const handleView = useCallback(async () => {
    if (!canView) return;
    if (!isMasked) {
      // 已显示时点击重置计时器
      resetTimer(30);
      return;
    }

    setLoading(true);
    try {
      const res = await viewSensitive(accountId);
      const data = res.data as any;
      const value = data?.[field] || '';
      setPlainText(value);
      setIsRevealed(true);
      setAuditLogged(true);
      startTimer(30);
    } catch (err: any) {
      showToast('error', err.message || '获取敏感信息失败');
    } finally {
      setLoading(false);
    }
  }, [canView, isMasked, resetTimer, accountId, field, startTimer, showToast]);

  /** 复制敏感信息 */
  const handleCopy = useCallback(async () => {
    try {
      const res = await copySensitiveField(accountId, field);
      const value = res.data as string;
      if (value) {
        await navigator.clipboard.writeText(value);
      }
      showToast('success', '已复制到剪贴板');
      resetTimer(30);
    } catch (err: any) {
      showToast('error', err.message || '复制失败');
    }
  }, [accountId, field, resetTimer, showToast]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      {/* 左侧：标签 + 值 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>{label}</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {/* 脱敏显示 */}
          {isMasked ? (
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'monospace',
                letterSpacing: 2,
                color: 'var(--color-masked-text)',
                backgroundColor: 'var(--color-masked-bg)',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid var(--color-masked-border)',
              }}
            >
              ••••••
            </span>
          ) : (
            /* 明文显示 */
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#1F2937',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              {plainText}
            </span>
          )}

          {/* 审计日志已记录标识 */}
          {auditLogged && !isMasked && (
            <Tooltip title="已记录审计日志">
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 14, color: '#059669' }} />
                <span style={{ fontSize: 11, color: '#059669', marginLeft: 2 }}>已记录日志</span>
              </span>
            </Tooltip>
          )}

          {/* 剩余时间提示 */}
          {!isMasked && timeLeft > 0 && (
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{timeLeft}s</span>
          )}
        </div>
      </div>

      {/* 右侧操作按钮 */}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0, marginLeft: 8 }}>
        {canView ? (
          <Tooltip title={isMasked ? '查看敏感信息' : '重置30秒'}>
            <span>
              <IconButton
                size="small"
                onClick={handleView}
                disabled={loading}
                sx={{ color: '#6B7280' }}
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: '#6B7280' }} />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="暂无权限查看敏感信息">
            <span>
              <IconButton size="small" disabled sx={{ color: '#D1D5DB' }}>
                <Visibility fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {!isMasked && (
          <Tooltip title="复制">
            <IconButton size="small" onClick={handleCopy} sx={{ color: '#6B7280' }}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default SensitiveField;
