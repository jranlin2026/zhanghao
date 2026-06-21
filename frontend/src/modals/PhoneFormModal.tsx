import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPhone, updatePhone } from '@/api/phones';
import { getDevices } from '@/api/devices';
import type { CreatePhoneNumberRequest, PhoneNumberDTO } from '@/types/phone';
import { useUIStore } from '@/stores/uiStore';
import { SLOT_TYPE_LABELS, CARRIERS } from '@/utils/constants';

interface PhoneFormModalProps {
  open: boolean;
  editData?: PhoneNumberDTO | null;
}

/**
 * 新增/编辑手机号弹窗
 * React Hook Form + MUI
 */
const PhoneFormModal: React.FC<PhoneFormModalProps> = ({ open, editData }) => {
  const { closeModal, showToast } = useUIStore();
  const queryClient = useQueryClient();
  const isEdit = !!editData;

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreatePhoneNumberRequest>({
    defaultValues: {
      device_id: 0 as unknown as number,
      slot_type: 'sim1',
      phone_number: '',
      carrier: '中国移动',
      is_primary: false,
      monthly_fee: 0,
      plan_type: '',
      owner_user_id: null,
      status: '启用中',
      remark: '',
    },
  });

  // 获取设备列表
  const { data: devicesRes } = useQuery({
    queryKey: ['devices-mini'],
    queryFn: () => getDevices({ pageSize: 200 }),
    enabled: open,
  });
  const devices = devicesRes?.data || [];

  // 编辑模式填充数据
  useEffect(() => {
    if (editData) {
      reset({
        device_id: editData.device_id,
        slot_type: editData.slot_type,
        phone_number: editData.phone_number,
        carrier: editData.carrier,
        is_primary: editData.is_primary,
        monthly_fee: editData.monthly_fee,
        plan_type: editData.plan_type || '',
        owner_user_id: editData.owner_user_id,
        status: editData.status,
        remark: editData.remark || '',
      });
    } else {
      reset({
        device_id: 0 as unknown as number,
        slot_type: 'sim1',
        phone_number: '',
        carrier: '中国移动',
        is_primary: false,
        monthly_fee: 0,
        plan_type: '',
        owner_user_id: null,
        status: '启用中',
        remark: '',
      });
    }
  }, [editData, reset]);

  // 创建/更新 mutation
  const mutation = useMutation({
    mutationFn: (data: CreatePhoneNumberRequest) => {
      if (isEdit && editData) {
        return updatePhone(editData.id, data);
      }
      return createPhone(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phones'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      showToast('success', isEdit ? '手机号更新成功' : '手机号创建成功');
      closeModal();
    },
    onError: (err: Error) => {
      showToast('error', `操作失败: ${err.message}`);
    },
  });

  const onSubmit = (data: CreatePhoneNumberRequest) => {
    mutation.mutate(data);
  };

  return (
    <Dialog
      open={open}
      onClose={closeModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { borderRadius: 12, padding: '4px 0' },
      }}
    >
      <DialogTitle style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>
        {isEdit ? '编辑手机号' : '新增手机号'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="device_id"
                control={control}
                rules={{ validate: (v) => (v && v > 0) || '请选择所属设备' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="所属设备 *"
                    fullWidth
                    size="small"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.device_id}
                    helperText={errors.device_id?.message}
                  >
                    <MenuItem value="">
                      <em>请选择设备</em>
                    </MenuItem>
                    {devices.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.device_name} ({d.device_code})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone_number"
                control={control}
                rules={{
                  required: '手机号不能为空',
                  pattern: { value: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                }}
                render={({ field }) => (
                  <TextField {...field} label="手机号 *" fullWidth size="small" error={!!errors.phone_number} helperText={errors.phone_number?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="carrier"
                control={control}
                rules={{ required: '请选择运营商' }}
                render={({ field }) => (
                  <TextField {...field} select label="运营商 *" fullWidth size="small">
                    {CARRIERS.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="slot_type"
                control={control}
                rules={{ required: '请选择卡槽' }}
                render={({ field }) => (
                  <TextField {...field} select label="SIM 卡槽 *" fullWidth size="small">
                    <MenuItem value="sim1">{SLOT_TYPE_LABELS.sim1}</MenuItem>
                    <MenuItem value="sim2">{SLOT_TYPE_LABELS.sim2}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="monthly_fee"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="月费用(元)" fullWidth size="small" type="number" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="plan_type"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="套餐类型" fullWidth size="small" value={field.value || ''} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="owner_user_id"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="负责人ID" fullWidth size="small" type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="is_primary"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value || false} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="主用号码"
                    style={{ marginLeft: 0 }}
                  />
                )}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="状态" fullWidth size="small">
                      <MenuItem value="启用中">启用中</MenuItem>
                      <MenuItem value="闲置">闲置</MenuItem>
                      <MenuItem value="已注销">已注销</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Controller
                name="remark"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="备注" fullWidth size="small" multiline rows={2} value={field.value || ''} />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions style={{ padding: '8px 24px 16px', gap: 8 }}>
          <Button onClick={closeModal} variant="outlined" size="small" style={{ color: '#374151', borderColor: 'var(--color-border)', textTransform: 'none' }}>
            取消
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={isSubmitting || mutation.isPending}
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff', textTransform: 'none' }}
          >
            {isSubmitting || mutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建手机号'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PhoneFormModal;
