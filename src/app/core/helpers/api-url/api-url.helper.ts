import {
  API_URL,
  AUTH_API_PREFIX,
  AUTH_TOKEN_LIFECYCLE_ENDPOINTS,
} from '@core/constants/api.constant';

const stripQuery = (url: string): string => url.split(/[?#]/)[0];

/**
 * Exact match or a path below the API base. A bare `startsWith(API_URL)` would also accept
 * look-alike hosts such as `https://api.example.com.evil.com` and leak credentials there.
 */
export const isApiUrl = (url: string): boolean => {
  const path = stripQuery(url);
  return path === API_URL || path.startsWith(`${API_URL}/`);
};

export const isAuthApiUrl = (url: string): boolean => stripQuery(url).startsWith(AUTH_API_PREFIX);

export const isAuthTokenLifecycleUrl = (url: string): boolean =>
  AUTH_TOKEN_LIFECYCLE_ENDPOINTS.includes(stripQuery(url));
