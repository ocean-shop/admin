export type RefreshResponse = {
  accessToken: string;
};

export type AccessTokenPayload = {
  sub?: string;
  userId?: string;
  id?: string;
};
