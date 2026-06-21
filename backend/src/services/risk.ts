type DeviceRiskInput = {
  owner_user_id: number | null;
  status: string;
  phone_numbers?: unknown[];
};

type PhoneRiskInput = {
  owner_user_id: number | null;
  status: string;
  internet_accounts?: unknown[];
};

type AccountRiskInput = {
  owner_user_id: number | null;
  status: string;
  permission_status: string;
};

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export function getDeviceRiskLevel(device: DeviceRiskInput): RiskLevel {
  if (!device.owner_user_id || device.status === '异常') {
    return 'high';
  }
  if ((device.phone_numbers ?? []).length === 0) {
    return 'medium';
  }
  return 'none';
}

export function getPhoneRiskLevel(phone: PhoneRiskInput): RiskLevel {
  if (!phone.owner_user_id || phone.status === '异常') {
    return 'high';
  }
  if ((phone.internet_accounts ?? []).length === 0) {
    return 'low';
  }
  return 'none';
}

export function getAccountRiskLevel(account: AccountRiskInput): RiskLevel {
  if (!account.owner_user_id || account.status === '异常' || account.permission_status === '离职待收回') {
    return 'high';
  }
  return 'none';
}
