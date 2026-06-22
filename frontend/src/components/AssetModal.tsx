import type { AssetEntity, AssetMeta, ViewType } from '../types/assets';

type Props = {
  view: ViewType;
  entity: AssetEntity | null;
  meta: AssetMeta | null;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
};

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea';
  options?: Array<{ value: string | number; label: string }>;
};

const statusOptions = ['使用中', '闲置', '异常', '已注销'].map((item) => ({ value: item, label: item }));
const simOptions = [
  { value: 'single', label: '单卡' },
  { value: 'dual', label: '双卡' },
];
const ownerSubjectOptions = ['公司', '法人', '员工个人', '客户', '代理', '其他'].map((item) => ({ value: item, label: item }));
const slotOptions = [
  { value: 'sim1', label: 'SIM1' },
  { value: 'sim2', label: 'SIM2' },
];
const carrierOptions = ['中国移动', '中国联通', '中国电信', '虚拟运营商'].map((item) => ({ value: item, label: item }));
const platformOptions = ['微信', '抖音', '小红书', '快手', 'TikTok', 'Google', 'QQ', '微博', 'B站', '淘宝', '京东', '其他'].map((item) => ({ value: item, label: item }));
const permissionOptions = ['正常', '离职待收回', '已收回', '需复核'].map((item) => ({ value: item, label: item }));

function optionFromMeta(items: Array<{ id: number; name: string; code?: string }> = []) {
  return [{ value: '', label: '未选择' }, ...items.map((item) => ({ value: item.id, label: item.code ? `${item.name} (${item.code})` : item.name }))];
}

function fieldsFor(view: ViewType, meta: AssetMeta | null): Field[] {
  if (view === 'devices') {
    return [
      { key: 'device_name', label: '设备名称' },
      { key: 'brand_model', label: '品牌型号' },
      { key: 'imei', label: 'IMEI' },
      { key: 'sim_type', label: 'SIM 类型', type: 'select', options: simOptions },
      { key: 'owner_subject', label: '所属主体', type: 'select', options: ownerSubjectOptions },
      { key: 'department_id', label: '所属部门', type: 'select', options: optionFromMeta(meta?.departments) },
      { key: 'owner_user_id', label: '负责人', type: 'select', options: optionFromMeta(meta?.users) },
      { key: 'current_user_id', label: '当前使用人', type: 'select', options: optionFromMeta(meta?.users) },
      { key: 'status', label: '状态', type: 'select', options: statusOptions },
      { key: 'remark', label: '备注', type: 'textarea' },
    ];
  }

  if (view === 'phones') {
    return [
      { key: 'device_id', label: '所属设备', type: 'select', options: optionFromMeta(meta?.devices) },
      { key: 'slot_type', label: 'SIM 卡槽', type: 'select', options: slotOptions },
      { key: 'phone_number', label: '手机号' },
      { key: 'carrier', label: '运营商', type: 'select', options: carrierOptions },
      { key: 'monthly_fee', label: '月费', type: 'number' },
      { key: 'owner_user_id', label: '负责人', type: 'select', options: optionFromMeta(meta?.users) },
      { key: 'status', label: '状态', type: 'select', options: statusOptions },
      { key: 'remark', label: '备注', type: 'textarea' },
    ];
  }

  return [
    { key: 'phone_number_id', label: '绑定手机号', type: 'select', options: optionFromMeta(meta?.phones) },
    { key: 'platform', label: '平台', type: 'select', options: platformOptions },
    { key: 'account_name', label: '账号名称' },
    { key: 'login_account', label: '登录账号' },
    { key: 'owner_subject', label: '所属主体', type: 'select', options: ownerSubjectOptions },
    { key: 'department_id', label: '所属部门', type: 'select', options: optionFromMeta(meta?.departments) },
    { key: 'owner_user_id', label: '负责人', type: 'select', options: optionFromMeta(meta?.users) },
    { key: 'current_user_id', label: '当前使用人', type: 'select', options: optionFromMeta(meta?.users) },
    { key: 'permission_status', label: '权限状态', type: 'select', options: permissionOptions },
    { key: 'status', label: '账号状态', type: 'select', options: statusOptions },
    { key: 'remark', label: '备注', type: 'textarea' },
  ];
}

function getDefaultValue(entity: AssetEntity | null, key: string) {
  if (!entity) return '';
  const value = (entity as unknown as Record<string, unknown>)[key];
  return value === null || value === undefined ? '' : String(value);
}

function renderField(field: Field, entity: AssetEntity | null) {
  const defaultValue = getDefaultValue(entity, field.key);
  if (field.type === 'select') {
    return (
      <select className="select" name={field.key} defaultValue={defaultValue}>
        {field.options?.map((option) => (
          <option key={String(option.value)} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  }
  if (field.type === 'textarea') return <textarea className="input" name={field.key} defaultValue={defaultValue} rows={3} />;
  return <input className="input" name={field.key} type={field.type ?? 'text'} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? '0.01' : undefined} defaultValue={defaultValue} />;
}

export function AssetModal({ view, entity, meta, onClose, onSubmit }: Props) {
  const title = view === 'devices' ? '设备' : view === 'phones' ? '手机号' : '互联网账号';
  return (
    <div className="modal-overlay open">
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(Object.fromEntries(new FormData(event.currentTarget).entries()));
        }}
      >
        <div className="modal-header">
          <h3>{entity ? '编辑' : '新增'}{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>x</button>
        </div>
        <div className="modal-body">
          <div className="form-section-title">基础信息</div>
          <div className="form-row-wrap">
            {fieldsFor(view, meta).map((field) => (
              <label className="form-group" key={field.key}>
                <span>{field.label}</span>
                {renderField(field, entity)}
              </label>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
          <button type="submit" className="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  );
}
