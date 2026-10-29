import { API_URL, AUTH_API_ENDPOINTS } from '@core/constants/api.constant';
import { isApiUrl, isAuthApiUrl, isAuthTokenLifecycleUrl } from './api-url.helper';

describe('api-url.helper', () => {
  describe('isApiUrl', () => {
    it('accepts the API base and paths below it', () => {
      expect(isApiUrl(API_URL)).toBe(true);
      expect(isApiUrl(`${API_URL}/shops`)).toBe(true);
      expect(isApiUrl(`${API_URL}/shops?page=1`)).toBe(true);
    });

    it('rejects look-alike hosts and foreign URLs', () => {
      expect(isApiUrl(`${API_URL}.evil.com/shops`)).toBe(false);
      expect(isApiUrl(`${API_URL}evil/shops`)).toBe(false);
      expect(isApiUrl('https://cdn.example.com/image.png')).toBe(false);
      expect(isApiUrl('/assets/config.json')).toBe(false);
    });
  });

  describe('isAuthApiUrl', () => {
    it('matches only auth endpoints of the API', () => {
      expect(isAuthApiUrl(AUTH_API_ENDPOINTS.VERIFY_OTP)).toBe(true);
      expect(isAuthApiUrl(`${API_URL}/shops`)).toBe(false);
      expect(isAuthApiUrl('https://other.dev/user/auth/refresh')).toBe(false);
    });
  });

  describe('isAuthTokenLifecycleUrl', () => {
    it('matches refresh and logout, ignoring query strings', () => {
      expect(isAuthTokenLifecycleUrl(AUTH_API_ENDPOINTS.REFRESH)).toBe(true);
      expect(isAuthTokenLifecycleUrl(`${AUTH_API_ENDPOINTS.LOGOUT}?all=1`)).toBe(true);
    });

    it('does not match other auth endpoints or substrings', () => {
      expect(isAuthTokenLifecycleUrl(AUTH_API_ENDPOINTS.VERIFY_OTP)).toBe(false);
      expect(isAuthTokenLifecycleUrl(`${API_URL}/shops/refresh`)).toBe(false);
    });
  });
});
