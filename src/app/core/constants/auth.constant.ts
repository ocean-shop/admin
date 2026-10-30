export const SESSION_HINT_KEY = 'auth_session_hint';
/** The access token used to live in storage; it is now kept in memory only and this key is purged. */
export const LEGACY_ACCESS_TOKEN_KEY = 'auth_access_token';
export const VIEW_STORAGE_KEY = 'login_current_view';
export const IDENTITY_STORAGE_KEY = 'login_identity';
export const OTP_EXPIRATION_KEY = 'otp_expiration_time';

export const AUTH_STORAGE_KEYS = [
  LEGACY_ACCESS_TOKEN_KEY,
  SESSION_HINT_KEY,
  VIEW_STORAGE_KEY,
  IDENTITY_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
] as const;

export const AUTH_LOG_SCOPE = 'AuthService';

export const AUTH_LOG_MESSAGES = {
  REFRESH_STARTED: 'Starting refresh request',
  REFRESH_STALE_IGNORED: 'Ignoring stale refresh response',
  REFRESH_SUCCEEDED: 'Refresh succeeded and token updated',
  REFRESH_FINALIZED: 'Refresh request finalized',
  SESSION_REUSED_FROM_TAB: 'Reusing session refreshed by another tab',
  SESSION_SYNCED_FROM_TAB: 'Synced session from another tab',
  LOGGED_OUT_FROM_TAB: 'Logged out from another tab',
} as const;

export const AUTH_BROADCAST_CHANNEL = 'ocean-admin-auth';
/** Web Lock that serializes refreshes across tabs: the API rotates the refresh cookie on each one. */
export const AUTH_REFRESH_LOCK = 'ocean-admin-auth-refresh';
