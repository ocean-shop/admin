import { AuthResponse, AuthUser } from '@core/models/auth.model';

export function buildAuthSession(
  accessToken = 'access-token',
  user: Partial<AuthUser> = {},
): AuthResponse {
  return {
    accessToken,
    user: {
      id: 'admin-1',
      email: 'admin@ocean.dev',
      mobileNumber: null,
      role: 'admin',
      ...user,
    },
  };
}
