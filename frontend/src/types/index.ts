/**
 * 类型聚合导出
 * 统一导出所有 DTO 类型
 */

export type { ApiResponse, PaginatedResponse, PaginationMeta, PaginationParams } from './api';

export type {
  DeviceDTO,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  DeviceQueryParams,
  DeviceStats,
} from './device';

export type {
  PhoneNumberDTO,
  CreatePhoneNumberRequest,
  UpdatePhoneNumberRequest,
  PhoneQueryParams,
} from './phone';

export type {
  InternetAccountDTO,
  SensitiveInfoDTO,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountQueryParams,
  BatchOperationRequest,
} from './account';

export type {
  UserDTO,
  LoginRequest,
  LoginResponse,
  UserListItem,
  CreateUserRequest,
  UpdateUserRequest,
  RoleInfo,
} from './auth';

export type {
  RiskDTO,
  RiskQueryParams,
  UpdateRiskStatusRequest,
} from './risk';

export type {
  OperationLogDTO,
  LogQueryParams,
} from './log';
