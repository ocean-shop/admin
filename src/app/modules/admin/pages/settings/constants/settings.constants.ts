import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

export const SETTINGS_LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Ukrainian', value: 'uk' },
  { label: 'Russian', value: 'ru' },
];

export const LANGUAGE_STORAGE_KEY = 'admin_language';

export const DEFAULT_LANGUAGE = 'en';
