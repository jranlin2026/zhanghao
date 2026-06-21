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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDevice, updateDevice } from '@/api/devices';
import type { CreateDeviceRequest, DeviceDTO } from '@/types/device';
import { useUIStore } from '@/stores/uiStore';
import { SIM_TYPES, OWNER_SUBJECTS, PREDEFINED_DEPARTMENTS } from '@/utils/constants';
import { SIM_TYPE_LABELS } from '@/utils/constants';

interface DeviceFormModalProps {
  open: boolean;
  /** 编辑模式时传入已有设备数据 */
  editData?: DeviceDTO | null;
}

/**
 * 新增/编辑设备弹窗
 * React Hook Form + MUI
 */
const DeviceFormModal: React.FC<DeviceFormModalProps> = ({ open, editData }) => {
  const { closeModal, showToast } = useUIStore();
  const queryClient = useQueryClient();
  const isEdit = !!editData;

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateDeviceRequest>({
    defaultValues: {
      device_name: '',
      brand_model: '',
      imei: '',
      sim_type: 'single',
      owner_subject: '公司',
      department_id: null,
      owner_user_id: null,
      current_user_id: null,
      status: '启用中',
      remark: '',
    },
  });

  // 编辑模式填充数据
  useEffect(() => {
    if (editData) {
      reset({
        device_name: editData.device_name,
        brand_model: editData.brand_model,
        imei: editData.imei,
        sim_type: editData.sim_type,
        owner_subject: editData.owner_subject,
        department_id: editData.department_id,
        owner_user_id: editData.owner_user_id,
        current_user_id: editData.current_user_id,
        status: editData.status,
        remark: editData.remark || '',
      });
    } else {
      reset({
        device_name: '',
        brand_model: '',
        imei: '',
        sim_type: 'single',
        owner_subject: '公司',
        department_id: null,
        owner_user_id: null,
        current_user_id: null,
        status: '启用中',
        remark: '',
      });
    }
  }, [editData, reset]);

  // 创建/更新 mutation
  const mutation = useMutation({
    mutationFn: (data: CreateDeviceRequest) => {
      if (isEdit && editData) {
        return updateDevice(editData.id, data);
      }
      return createDevice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-stats'] });
      showToast('success', isEdit ? '设备更新成功' : '设备创建成功');
      closeModal();
    },
    onError: (err: Error) => {
      showToast('error', `操作失败: ${err.message}`);
    },
  });

  const onSubmit = (data: CreateDeviceRequest) => {
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
        {isEdit ? '编辑设备' : '新增设备'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="device_name"
                control={control}
                rules={{ required: '设备名称不能为空', maxLength: { value: 100, message: '最多100字' } }}
                render={({ field }) => (
                  <TextField {...field} label="设备名称 *" fullWidth size="small" error={!!errors.device_name} helperText={errors.device_name?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="brand_model"
                control={control}
                rules={{ required: '品牌型号不能为空' }}
                render={({ field }) => (
                  <TextField {...field} label="品牌型号 *" fullWidth size="small" error={!!errors.brand_model} helperText={errors.brand_model?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="imei"
                control={control}
                rules={{ required: 'IMEI不能为空', pattern: { value: /^[A-Za-z0-9]{15,17}$/, message: 'IMEI格式不正确(15-17位字母数字)' } }}
                render={({ field }) => (
                  <TextField {...field} label="IMEI *" fullWidth size="small" error={!!errors.imei} helperText={errors.imei?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="sim_type"
                control={control}
                rules={{ required: '请选择SIM类型' }}
                render={({ field }) => (
                  <TextField {...field} select label="SIM 类型 *" fullWidth size="small">
                    {SIM_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>{SIM_TYPE_LABELS[type]}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="owner_subject"
                control={control}
                rules={{ required: '请选择所属主体' }}
                render={({ field }) => (
                  <TextField {...field} select label="所属主体 *" fullWidth size="small">
                    {OWNER_SUBJECTS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="department_id"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="所属部门" fullWidth size="small" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}>
                    <MenuItem value="">无</MenuItem>
                    {PREDEFINED_DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))}
                  </TextField>
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
                name="current_user_id"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="当前使用人ID" fullWidth size="small" type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                )}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="设备状态" fullWidth size="small">
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
                  <TextField {...field} label="备注" fullWidth size="small" multiline rows={2} />
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
            {isSubmitting || mutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建设备'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DeviceFormModal;
