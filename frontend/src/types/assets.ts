export type ViewType = 'devices' | 'phones' | 'accounts';

export type User = {
  id: number;
  name: string;
  role: string;
  roles: string[];
  department_name: string | null;
};

export type Device = {
  id: number;
  device_code: string;
  device_name: string;
  brand_model: string;
  imei: string;
  sim_type: string;
  owner_subject: string;
  department_id: number | null;
  department_name: string | null;
  owner_user_id: number | null;
  owner_name: string | null;
  current_user_id: number | null;
  current_user_name: string | null;
  status: string;
  risk_level: string;
  remark: string | null;
  updated_at: string;
  phone_numbers: PhoneNumber[];
};

export type PhoneNumber = {
  id: number;
  device_id: number;
  device_name: string | null;
  device_code: string | null;
  slot_type: string;
  phone_number_masked: string;
  carrier: string;
  owner_user_id: number | null;
  owner_name: string | null;
  status: string;
  risk_level: string;
  monthly_fee: number | null;
  updated_at: string;
  internet_accounts: InternetAccount[];
};

export type InternetAccount = {
  id: number;
  phone_number_id: number;
  account_code: string;
  platform: string;
  account_name: string;
  login_account_masked: string;
  bind_phone_masked: string;
  bind_email: string | null;
  owner_subject: string;
  department_id: number | null;
  department_name: string | null;
  owner_user_id: number | null;
  owner_name: string | null;
  current_user_id: number | null;
  current_user_name: string | null;
  permission_status: string;
  status: string;
  risk_level: string;
  updated_at: string;
  device_name: string | null;
};

export type AssetEntity = Device | PhoneNumber | InternetAccount;

export type Stats = {
  devices: number;
  phones: number;
  accounts: number;
  highRisk: number;
  noOwner: number;
};

export type ListResponse<T> = {
  code: number;
  data: T[];
  message: string;
  pagination: { page: number; pageSize: number; total: number };
};

export type ApiResponse<T> = {
  code: number;
  data: T;
  message: string;
};
