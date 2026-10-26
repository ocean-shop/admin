/** The signed-in admin as the API returns it alongside every access token. */
export type AuthUser = {
  id: string;
  email: string | null;
  mobileNumber: string | null;
  role: string | null;
};

/** Body of `verify-otp` and `refresh`; the refresh token travels only in an httpOnly cookie. */
export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};
