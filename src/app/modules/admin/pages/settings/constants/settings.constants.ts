import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

export const SETTINGS_LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Ukrainian', value: 'ua' },
  { label: 'Russian', value: 'ru' },
];

export const DEFAULT_LANGUAGE = 'en';

export const SETTINGS_REQUIRED_LANGUAGE_MESSAGE = "Поле мова є обов'язкове";
export const SETTINGS_UPDATED_SUCCESS_MESSAGE = 'Налаштування змінено';
