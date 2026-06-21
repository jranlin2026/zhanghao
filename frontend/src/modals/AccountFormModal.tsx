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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAccount, updateAccount } from '@/api/accounts';
import { getPhones } from '@/api/phones';
import type { CreateAccountRequest, InternetAccountDTO } from '@/types/account';
import { useUIStore } from '@/stores/uiStore';
import {
  PLATFORM_TYPES,
  OWNER_SUBJECTS,
  PERMISSION_STATUSES,
  PREDEFINED_DEPARTMENTS,
} from '@/utils/constants';

interface AccountFormModalProps {
  open: boolean;
  editData?: InternetAccountDTO | null;
}

/**
 * 新增/编辑互联网账号弹窗
 * React Hook Form + MUI
 */
const AccountFormModal: React.FC<AccountFormModalProps> = ({ open, editData }) => {
  const { closeModal, showToast } = useUIStore();
  const queryClient = useQueryClient();
  const isEdit = !!editData;

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateAccountRequest>({
    defaultValues: {
      phone_number_id: 0 as unknown as number,
      platform: '' as any,
      account_name: '',
      login_account: '',
      bind_phone: '',
      bind_email: '',
      owner_subject: '公司',
      purpose: '',
      monthly_fee: 0,
      expire_at: null,
      department_id: null,
      owner_user_id: null,
      current_user_id: null,
      permission_status: '待授权',
      status: '启用中',
      remark: '',
    },
  });

  // 获取手机号列表
  const { data: phonesRes } = useQuery({
    queryKey: ['phones-mini'],
    queryFn: () => getPhones({ pageSize: 200 }),
    enabled: open,
  });
  const phones = phonesRes?.data || [];

  // 编辑模式填充数据
  useEffect(() => {
    if (editData) {
      reset({
        phone_number_id: editData.phone_number_id,
        platform: editData.platform as any,
        account_name: editData.account_name,
        login_account: editData.login_account,
        bind_phone: editData.bind_phone || '',
        bind_email: editData.bind_email || '',
        owner_subject: editData.owner_subject,
        purpose: editData.purpose || '',
        monthly_fee: editData.monthly_fee,
        expire_at: editData.expire_at || null,
        department_id: editData.department_id,
        owner_user_id: editData.owner_user_id,
        current_user_id: editData.current_user_id,
        permission_status: editData.permission_status,
        status: editData.status,
        remark: editData.remark || '',
      });
    } else {
      reset({
        phone_number_id: 0 as unknown as number,
        platform: '' as any,
        account_name: '',
        login_account: '',
        bind_phone: '',
        bind_email: '',
        owner_subject: '公司',
        purpose: '',
        monthly_fee: 0,
        expire_at: null,
        department_id: null,
        owner_user_id: null,
        current_user_id: null,
        permission_status: '待授权',
        status: '启用中',
        remark: '',
      });
    }
  }, [editData, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateAccountRequest) => {
      if (isEdit && editData) {
        return updateAccount(editData.id, data);
      }
      return createAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      showToast('success', isEdit ? '账号更新成功' : '账号创建成功');
      closeModal();
    },
    onError: (err: Error) => {
      showToast('error', `操作失败: ${err.message}`);
    },
  });

  const onSubmit = (data: CreateAccountRequest) => {
    mutation.mutate(data);
  };

  return (
    <Dialog
      open={open}
      onClose={closeModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { borderRadius: 12, padding: '4px 0' },
      }}
    >
      <DialogTitle style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>
        {isEdit ? '编辑互联网账号' : '新增互联网账号'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* 基本信息 */}
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                基本信息
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone_number_id"
                control={control}
                rules={{ validate: (v) => (v && v > 0) || '请选择关联手机号' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="关联手机号 *"
                    fullWidth
                    size="small"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.phone_number_id}
                    helperText={errors.phone_number_id?.message}
                  >
                    <MenuItem value="">
                      <em>请选择手机号</em>
                    </MenuItem>
                    {phones.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.phone_number} ({p.carrier})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="platform"
                control={control}
                rules={{ required: '请选择平台' }}
                render={({ field }) => (
                  <TextField {...field} select label="平台 *" fullWidth size="small" value={field.value || ''}>
                    <MenuItem value="">
                      <em>请选择平台</em>
                    </MenuItem>
                    {PLATFORM_TYPES.map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="account_name"
                control={control}
                rules={{ required: '账号名称不能为空' }}
                render={({ field }) => (
                  <TextField {...field} label="账号名称 *" fullWidth size="small" error={!!errors.account_name} helperText={errors.account_name?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="login_account"
                control={control}
                rules={{ required: '登录账号不能为空' }}
                render={({ field }) => (
                  <TextField {...field} label="登录账号 *" fullWidth size="small" error={!!errors.login_account} helperText={errors.login_account?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="bind_phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="绑定手机号" fullWidth size="small" value={field.value || ''} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="bind_email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="绑定邮箱" fullWidth size="small" value={field.value || ''} />
                )}
              />
            </Grid>

            {/* 责任信息 */}
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                责任信息
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="owner_subject"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="所属主体" fullWidth size="small">
                    {OWNER_SUBJECTS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="permission_status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="权限状态" fullWidth size="small">
                    {PERMISSION_STATUSES.map((s) => (
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
                  <TextField
                    {...field}
                    select
                    label="所属部门"
                    fullWidth
                    size="small"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  >
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

            {/* 费用与期限 */}
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                费用与期限
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="monthly_fee"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="月费用(元)" fullWidth size="small" type="number" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="purpose"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="用途" fullWidth size="small" value={field.value || ''} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="expire_at"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="到期时间"
                    fullWidth
                    size="small"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
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
                    <TextField {...field} select label="账号状态" fullWidth size="small">
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
            {isSubmitting || mutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建账号'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AccountFormModal;
