import { describe, expect, it } from 'vitest';
import { validateAccountPayload, validateDevicePayload, validatePhonePayload } from '../services/validation';

describe('asset payload validation', () => {
  it('rejects missing device core fields', () => {
    expect(() => validateDevicePayload({ device_name: '', brand_model: 'iPhone', imei: '123' })).toThrow('设备名称不能为空');
    expect(() => validateDevicePayload({ device_name: '工作机', brand_model: '', imei: '123' })).toThrow('品牌型号不能为空');
    expect(() => validateDevicePayload({ device_name: '工作机', brand_model: 'iPhone', imei: '' })).toThrow('IMEI 不能为空');
  });

  it('rejects invalid imei values', () => {
    expect(() => validateDevicePayload({ device_name: '工作机', brand_model: 'iPhone', imei: 'abc' })).toThrow('IMEI 格式不正确');
  });

  it('rejects missing phone core fields', () => {
    expect(() => validatePhonePayload({ device_id: '', phone_number: '13912345678', carrier: '中国移动' })).toThrow('所属设备不能为空');
    expect(() => validatePhonePayload({ device_id: 1, phone_number: '', carrier: '中国移动' })).toThrow('手机号不能为空');
  });

  it('rejects missing account core fields', () => {
    expect(() => validateAccountPayload({ phone_number_id: 1, platform: '', account_name: '服务号', login_account: 'svc' })).toThrow('平台不能为空');
    expect(() => validateAccountPayload({ phone_number_id: 1, platform: '微信', account_name: '', login_account: 'svc' })).toThrow('账号名称不能为空');
  });

  it('allows partial updates to omit sensitive values', () => {
    expect(() => validatePhonePayload({ carrier: '中国移动' }, { partial: true })).not.toThrow();
    expect(() => validateAccountPayload({ account_name: '新名称' }, { partial: true })).not.toThrow();
  });

  it('rejects invalid monthly fees', () => {
    expect(() => validatePhonePayload({ device_id: 1, phone_number: '13912345678', carrier: '中国移动', monthly_fee: -1 })).toThrow('月费必须是非负数字');
    expect(() => validateAccountPayload({ phone_number_id: 1, platform: '微信', account_name: '服务号', login_account: 'svc', monthly_fee: 'abc' })).toThrow('月费必须是非负数字');
  });

  it('rejects invalid phone numbers', () => {
    expect(() => validatePhonePayload({ device_id: 1, phone_number: '12345', carrier: '中国移动' })).toThrow('手机号格式不正确');
  });
});
