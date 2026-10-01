import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

export const SETTINGS_LANGUAGE_OPTIONS: DropdownOption[] = [
  { label: 'English', value: 'en' },
  { label: 'Ukrainian', value: 'ua' },
  { label: 'Russian', value: 'ru' },
];

export const DEFAULT_LANGUAGE = 'en';

export const SETTINGS_REQUIRED_LANGUAGE_MESSAGE = "Поле мова є обов'язкове";
export const SETTINGS_UPDATED_SUCCESS_MESSAGE = 'Налаштування змінено';

export const SETTINGS_CACHE_TITLE = 'Кеш';
export const SETTINGS_CACHE_DESCRIPTION =
  'Очистити кеш, щоб у магазині одразу застосувались останні зміни.';
export const SETTINGS_CACHE_INVALIDATE_LABEL = 'Очистити кеш';
export const SETTINGS_CACHE_INVALIDATE_ICON = 'cached';
export const SETTINGS_CACHE_INVALIDATED_SUCCESS_MESSAGE = 'Кеш очищено';
