import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { getUsers } from '@/api/admin';
import { batchOperation } from '@/api/accounts';
import { updateDevice } from '@/api/devices';
import { updatePhone } from '@/api/phones';
import type { UserListItem } from '@/types/auth';
import { ENTITY_TYPE_LABELS } from '@/utils/constants';
import { useUIStore } from '@/stores/uiStore';
import { useQueryClient } from '@tanstack/react-query';

interface TransferOwnerModalProps {
  open: boolean;
  onClose: () => void;
  /** 实体类型 */
  entityType: 'device' | 'phone' | 'account';
  /** 实体 ID */
  entityId: number;
  /** 当前负责人名称（显示用） */
  currentOwnerName?: string;
  /** 当前负责人 ID */
  currentOwnerId?: number;
}

/**
 * 移交负责人弹窗
 *
 * - 显示当前负责人信息
 * - 从 admin API 获取用户列表（选择新负责人）
 * - 根据实体类型调用不同 API
 * - 成功 → 关闭弹窗 + invalidateQueries + Toast
 */
const TransferOwnerModal: React.FC<TransferOwnerModalProps> = ({
  open,
  onClose,
  entityType,
  entityId,
  currentOwnerName,
  currentOwnerId,
}) => {
  const [targetUserId, setTargetUserId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  // 加载用户列表
  useEffect(() => {
    if (open) {
      setUsersLoading(true);
      getUsers({ pageSize: 100 })
        .then((res) => {
          setUsers(res.data || []);
        })
        .catch(() => {
          showToast('error', '加载用户列表失败');
        })
        .finally(() => {
          setUsersLoading(false);
        });
    }
  }, [open, showToast]);

  // 重置状态
  useEffect(() => {
    if (open) {
      setTargetUserId('');
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!targetUserId || !entityId) return;

    setLoading(true);
    try {
      const targetUser = users.find((u) => u.id === targetUserId);
      const targetUserName = targetUser?.name || String(targetUserId);

      if (entityType === 'account') {
        await batchOperation({
          ids: [entityId],
          action: 'change_owner',
          value: targetUserId,
        });
      } else if (entityType === 'device') {
        await updateDevice(entityId, { owner_user_id: targetUserId });
      } else if (entityType === 'phone') {
        await updatePhone(entityId, { owner_user_id: targetUserId });
      }

      showToast('success', `${ENTITY_TYPE_LABELS[entityType]}负责人已移交给 ${targetUserName}`);
      onClose();

      // 刷新相关列表
      if (entityType === 'account') {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      } else if (entityType === 'device') {
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        queryClient.invalidateQueries({ queryKey: ['device-stats'] });
      } else if (entityType === 'phone') {
        queryClient.invalidateQueries({ queryKey: ['phones'] });
      }
    } catch (err: any) {
      showToast('error', err.message || '移交失败');
    } finally {
      setLoading(false);
    }
  };

  const entityTypeLabel = ENTITY_TYPE_LABELS[entityType];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ style: { borderRadius: 12 } }}
    >
      <DialogTitle>移交负责人</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {/* 当前负责人信息 */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            当前 <strong>{entityTypeLabel}</strong>
            {currentOwnerName ? (
              <> 负责人为 <strong>{currentOwnerName}</strong></>
            ) : (
              <>没有负责人</>
            )}
            ，请选择新的负责人：
          </Typography>

          {/* 目标用户选择 */}
          <FormControl fullWidth size="small">
            <InputLabel>选择新负责人</InputLabel>
            <Select
              value={targetUserId}
              label="选择新负责人"
              onChange={(e) => setTargetUserId(e.target.value as number)}
            >
              {usersLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  加载中...
                </MenuItem>
              ) : (
                users
                  .filter((u) => u.status === 'active')
                  .map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} {user.department_name ? `(${user.department_name})` : ''}
                    </MenuItem>
                  ))
              )}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none', color: '#374151', borderColor: 'var(--color-border)' }}
        >
          取消
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          size="small"
          disabled={!targetUserId || loading}
          sx={{ textTransform: 'none' }}
        >
          {loading ? '处理中...' : '确认移交'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferOwnerModal;
