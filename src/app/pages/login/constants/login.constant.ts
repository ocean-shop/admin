export {
  VIEW_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
  IDENTITY_STORAGE_KEY,
} from '../../../core/constants/auth.constant';

export const IDENTITY_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]+|\d{10})$/;
export const OTP_PATTERN = /^\d{4}$/;
