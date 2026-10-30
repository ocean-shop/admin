import { environment } from '../../../environments/environment';

export const API_URL = environment.API_URL;

export const AUTH_API_PREFIX = `${API_URL}/user/auth/`;

export const AUTH_API_ENDPOINTS = {
  REQUEST_OTP: `${AUTH_API_PREFIX}admin/request-otp`,
  VERIFY_OTP: `${AUTH_API_PREFIX}verify-otp`,
  REFRESH: `${AUTH_API_PREFIX}refresh`,
  LOGOUT: `${AUTH_API_PREFIX}logout`,
} as const;

/** Auth endpoints that manage the token themselves and must not carry the bearer header. */
export const AUTH_TOKEN_LIFECYCLE_ENDPOINTS: readonly string[] = [
  AUTH_API_ENDPOINTS.REFRESH,
  AUTH_API_ENDPOINTS.LOGOUT,
];
