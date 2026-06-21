type Payload = Record<string, unknown>;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === '';
}

function requireField(payload: Payload, key: string, label: string): void {
  if (isBlank(payload[key])) {
    const error = new Error(`${label}不能为空`) as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }
}

export function validateDevicePayload(payload: Payload): void {
  requireField(payload, 'device_name', '设备名称');
  requireField(payload, 'brand_model', '品牌型号');
  requireField(payload, 'imei', 'IMEI ');
}

export function validatePhonePayload(payload: Payload): void {
  requireField(payload, 'device_id', '所属设备');
  requireField(payload, 'phone_number', '手机号');
  requireField(payload, 'carrier', '运营商');
}

export function validateAccountPayload(payload: Payload): void {
  requireField(payload, 'phone_number_id', '绑定手机号');
  requireField(payload, 'platform', '平台');
  requireField(payload, 'account_name', '账号名称');
  requireField(payload, 'login_account', '登录账号');
}
