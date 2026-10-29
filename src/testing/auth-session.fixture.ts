import { AuthResponse, AuthUser } from '@core/models/auth.model';

export const buildAuthSession = (
  accessToken = 'access-token',
  user: Partial<AuthUser> = {},
): AuthResponse => ({
  accessToken,
  user: {
    id: 'admin-1',
    email: 'admin@ocean.dev',
    mobileNumber: null,
    role: 'admin',
    ...user,
  },
});
