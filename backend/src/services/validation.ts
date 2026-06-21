type Payload = Record<string, unknown>;
type ValidationOptions = {
  partial?: boolean;
};

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

function requireForCreateOrPresent(payload: Payload, key: string, label: string, options: ValidationOptions): void {
  if (options.partial && !(key in payload)) {
    return;
  }
  requireField(payload, key, label);
}

function validateNonNegativeNumber(payload: Payload, key: string, label: string): void {
  if (!(key in payload) || isBlank(payload[key])) {
    return;
  }

  const value = Number(payload[key]);
  if (!Number.isFinite(value) || value < 0) {
    const error = new Error(`${label}必须是非负数字`) as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }
}

function validatePhoneNumberFormat(payload: Payload): void {
  if (!('phone_number' in payload) || isBlank(payload.phone_number)) {
    return;
  }

  if (!/^1\d{10}$/.test(String(payload.phone_number))) {
    const error = new Error('手机号格式不正确') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }
}

function validateImeiFormat(payload: Payload): void {
  if (!('imei' in payload) || isBlank(payload.imei)) {
    return;
  }

  if (!/^\d{15}$/.test(String(payload.imei))) {
    const error = new Error('IMEI 格式不正确') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }
}

export function validateDevicePayload(payload: Payload, options: ValidationOptions = {}): void {
  requireField(payload, 'device_name', '设备名称');
  requireField(payload, 'brand_model', '品牌型号');
  requireField(payload, 'imei', 'IMEI ');
  validateImeiFormat(payload);
}

export function validatePhonePayload(payload: Payload, options: ValidationOptions = {}): void {
  requireForCreateOrPresent(payload, 'device_id', '所属设备', options);
  requireForCreateOrPresent(payload, 'phone_number', '手机号', options);
  requireForCreateOrPresent(payload, 'carrier', '运营商', options);
  validatePhoneNumberFormat(payload);
  validateNonNegativeNumber(payload, 'monthly_fee', '月费');
}

export function validateAccountPayload(payload: Payload, options: ValidationOptions = {}): void {
  requireForCreateOrPresent(payload, 'phone_number_id', '绑定手机号', options);
  requireForCreateOrPresent(payload, 'platform', '平台', options);
  requireForCreateOrPresent(payload, 'account_name', '账号名称', options);
  requireForCreateOrPresent(payload, 'login_account', '登录账号', options);
  validateNonNegativeNumber(payload, 'monthly_fee', '月费');
}
