import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
export {
  VIEW_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
  IDENTITY_STORAGE_KEY,
} from '../../../core/constants/auth.constant';

export const LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Українська', value: 'ua' },
  { label: 'Русский', value: 'ru' },
];

export const IDENTITY_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]+|\d{10})$/;
export const OTP_PATTERN = /^\d{4}$/;
