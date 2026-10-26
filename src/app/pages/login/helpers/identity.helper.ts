import { OtpIdentityPayload } from '../models/login.model';

export const buildIdentityPayload = (identity: string): OtpIdentityPayload => {
  const value = identity.trim();
  return value.includes('@') ? { email: value } : { phone: value };
};
