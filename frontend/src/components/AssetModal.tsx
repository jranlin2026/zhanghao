import type { AssetEntity, ViewType } from '../types/assets';

type Props = {
  view: ViewType;
  entity: AssetEntity | null;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
};

const fields = {
  devices: [
    ['device_name', '设备名称'],
    ['brand_model', '品牌型号'],
    ['imei', 'IMEI'],
    ['sim_type', 'SIM 类型'],
    ['owner_subject', '所属主体'],
    ['department_id', '部门 ID'],
    ['owner_user_id', '负责人 ID'],
    ['current_user_id', '当前使用人 ID'],
    ['status', '状态'],
    ['remark', '备注'],
  ],
  phones: [
    ['device_id', '设备 ID'],
    ['slot_type', 'SIM 卡槽'],
    ['phone_number', '手机号'],
    ['carrier', '运营商'],
    ['monthly_fee', '月费'],
    ['owner_user_id', '负责人 ID'],
    ['status', '状态'],
    ['remark', '备注'],
  ],
  accounts: [
    ['phone_number_id', '手机号 ID'],
    ['platform', '平台'],
    ['account_name', '账号名称'],
    ['login_account', '登录账号'],
    ['owner_subject', '所属主体'],
    ['department_id', '部门 ID'],
    ['owner_user_id', '负责人 ID'],
    ['current_user_id', '当前使用人 ID'],
    ['permission_status', '权限状态'],
    ['status', '账号状态'],
    ['remark', '备注'],
  ],
} as const;

function getDefaultValue(entity: AssetEntity | null, key: string) {
  if (!entity) return '';
  const value = (entity as unknown as Record<string, unknown>)[key];
  return value === null || value === undefined ? '' : String(value);
}

export function AssetModal({ view, entity, onClose, onSubmit }: Props) {
  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const values = Object.fromEntries(formData.entries());
          onSubmit(values);
        }}
      >
        <div className="modal-header">
          <h2>{entity ? '编辑' : '新增'}{view === 'devices' ? '设备' : view === 'phones' ? '手机号' : '互联网账号'}</h2>
          <button type="button" className="icon-button" onClick={onClose}>×</button>
        </div>
        <div className="form-grid">
          {fields[view].map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <input name={key} defaultValue={getDefaultValue(entity, key)} />
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>取消</button>
          <button type="submit" className="primary-button">保存</button>
        </div>
      </form>
    </div>
  );
}
