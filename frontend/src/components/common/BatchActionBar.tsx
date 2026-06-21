import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import ConfirmDialog from './ConfirmDialog';
import { usePermission } from '@/hooks/usePermission';

interface BatchAction {
  key: string;
  label: string;
  danger?: boolean;
  description?: string;
}

interface BatchActionBarProps {
  /** 选中行数 */
  selectedCount: number;
  /** 可用操作列表 */
  actions: BatchAction[];
  /** 执行操作回调 */
  onAction: (action: string) => void;
  /** 清除选中 */
  onClear: () => void;
}

/**
 * 批量操作栏
 * 选中至少一行后显示
 * 默认操作：收回权限、移交负责人、标记高风险、导出所选
 */
const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  actions,
  onAction,
  onClear,
}) => {
  const { canBatch } = usePermission();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmAction, setConfirmAction] = useState<BatchAction | null>(null);

  if (selectedCount === 0 || !canBatch) return null;

  const handleActionClick = (action: BatchAction) => {
    setAnchorEl(null);
    if (action.danger) {
      setConfirmAction(action);
    } else {
      onAction(action.key);
    }
  };

  const handleConfirm = () => {
    if (confirmAction) {
      onAction(confirmAction.key);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          backgroundColor: 'var(--color-primary-bg)',
          border: '1px solid var(--color-primary)',
          borderRadius: 8,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>
          已选择 <strong>{selectedCount}</strong> 项
        </span>

        <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
          {actions.slice(0, 3).map((action) => (
            <Button
              key={action.key}
              size="small"
              variant="text"
              onClick={() => handleActionClick(action)}
              style={{
                fontSize: 12,
                textTransform: 'none',
                color: action.danger ? '#DC2626' : 'var(--color-primary)',
                fontWeight: 500,
                minWidth: 'auto',
                padding: '4px 12px',
              }}
            >
              {action.label}
            </Button>
          ))}
          {actions.length > 3 && (
            <>
              <Button
                size="small"
                variant="text"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                style={{
                  fontSize: 12,
                  textTransform: 'none',
                  color: '#6B7280',
                  fontWeight: 500,
                  minWidth: 'auto',
                  padding: '4px 8px',
                }}
              >
                更多 ▼
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {actions.slice(3).map((action) => (
                  <MenuItem
                    key={action.key}
                    onClick={() => handleActionClick(action)}
                    sx={{ fontSize: 13, color: action.danger ? '#DC2626' : '#374151' }}
                  >
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <Button
          size="small"
          variant="text"
          onClick={onClear}
          style={{
            fontSize: 12,
            textTransform: 'none',
            color: '#6B7280',
            fontWeight: 400,
            minWidth: 'auto',
            padding: '4px 8px',
          }}
        >
          取消选择
        </Button>
      </div>

      {/* 确认弹窗 */}
      {confirmAction && (
        <ConfirmDialog
          open={true}
          title={`确认${confirmAction.label}`}
          message={confirmAction.description || `确认执行「${confirmAction.label}」操作？此操作将影响 ${selectedCount} 个账号。`}
          confirmText={confirmAction.label}
          danger={confirmAction.danger}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
};

export default BatchActionBar;
