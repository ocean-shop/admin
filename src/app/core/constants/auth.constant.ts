export const SESSION_HINT_KEY = 'auth_session_hint';
export const VIEW_STORAGE_KEY = 'login_current_view';
export const IDENTITY_STORAGE_KEY = 'login_identity';
export const OTP_EXPIRATION_KEY = 'otp_expiration_time';

export const AUTH_STORAGE_KEYS = [
  SESSION_HINT_KEY,
  VIEW_STORAGE_KEY,
  IDENTITY_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
] as const;
