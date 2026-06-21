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

export function validateDevicePayload(payload: Payload, options: ValidationOptions = {}): void {
  requireField(payload, 'device_name', '设备名称');
  requireField(payload, 'brand_model', '品牌型号');
  requireField(payload, 'imei', 'IMEI ');
}

export function validatePhonePayload(payload: Payload, options: ValidationOptions = {}): void {
  requireForCreateOrPresent(payload, 'device_id', '所属设备', options);
  requireForCreateOrPresent(payload, 'phone_number', '手机号', options);
  requireForCreateOrPresent(payload, 'carrier', '运营商', options);
}

export function validateAccountPayload(payload: Payload, options: ValidationOptions = {}): void {
  requireForCreateOrPresent(payload, 'phone_number_id', '绑定手机号', options);
  requireForCreateOrPresent(payload, 'platform', '平台', options);
  requireForCreateOrPresent(payload, 'account_name', '账号名称', options);
  requireForCreateOrPresent(payload, 'login_account', '登录账号', options);
}
