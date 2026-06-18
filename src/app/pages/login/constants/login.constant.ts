import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

export const LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Українська', value: 'uk' },
  { label: 'Русский', value: 'ru' },
];

export const VIEW_STORAGE_KEY = 'login_current_view';
export const OTP_EXPIRATION_KEY = 'otp_expiration_time';

export const IDENTITY_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]+|\d{10})$/;
export const OTP_PATTERN = /^\d{4}$/;
