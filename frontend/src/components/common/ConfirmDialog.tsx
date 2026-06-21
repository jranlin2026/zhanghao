import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 确认弹窗组件
 * 用于删除/批量操作等需要二次确认的场景
 * 提供 danger 模式（红色确认按钮）
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 12,
          padding: '8px 0',
        },
      }}
    >
      <DialogTitle
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#1F2937',
          padding: '16px 24px 0',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent style={{ padding: '12px 24px' }}>
        <DialogContentText style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ padding: '8px 24px 16px', gap: 8 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          size="small"
          style={{
            color: '#374151',
            borderColor: 'var(--color-border)',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          size="small"
          style={{
            backgroundColor: danger ? '#DC2626' : 'var(--color-primary)',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
