export const SESSION_HINT_KEY = 'auth_session_hint';
export const ACCESS_TOKEN_KEY = 'auth_access_token';
export const VIEW_STORAGE_KEY = 'login_current_view';
export const IDENTITY_STORAGE_KEY = 'login_identity';
export const OTP_EXPIRATION_KEY = 'otp_expiration_time';

export const AUTH_STORAGE_KEYS = [
  ACCESS_TOKEN_KEY,
  SESSION_HINT_KEY,
  VIEW_STORAGE_KEY,
  IDENTITY_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
] as const;
