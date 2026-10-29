import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

export const ADMINS_TEXTS = {
  PAGE_TITLE: 'Адміністратори',
  CREATE_LABEL: 'Створити Адміна',
  EMPTY_STATE: 'Не знайдено адміністраторів.',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити адміністраторів. Спробуйте ще раз.',
  DEFAULT_ROLE: 'Адмін',
  SUPER_ROLE: 'Супер',
  DEFAULT_PHONE: 'Немає телефону',
  DEFAULT_EMAIL: 'Немає email',
  DEFAULT_NAME: 'Невідомий адміністратор',
  PAGINATION_LABEL: 'адміністраторів',
  MODAL_CREATE_TITLE: 'Створити Адміна',
  MODAL_UPDATE_TITLE: 'Оновити Адміна',
  MODAL_DELETE_TITLE: 'Видалити Адміна',
  MODAL_CREATE_CONFIRM_LABEL: 'Створити',
  MODAL_UPDATE_CONFIRM_LABEL: 'Оновити',
  MODAL_DELETE_CONFIRM_LABEL: 'Видалити',
  MODAL_DELETE_MESSAGE: 'Ви впевнені, що хочете видалити адміністратора',
  MODAL_DELETE_SUFFIX: '? Цю дію не можна скасувати.',
  IDENTITY_LABEL: 'Email або номер телефону',
  IDENTITY_PLACEHOLDER: 'Введіть email або номер телефону',
  IDENTITY_REQUIRED_MESSAGE: "Email або номер телефону обов'язковий",
  IDENTITY_INVALID_MESSAGE: 'Введіть дійсний email або номер телефону',
  ROLE_LABEL: 'Роль',
  ROLE_REQUIRED_MESSAGE: "Роль обов'язкова",
  SHOPS_LABEL: 'Магазини',
  SHOPS_PLACEHOLDER: 'Оберіть магазини',
  CREATE_SUCCESS_TITLE: 'Адміністратора створено',
  UPDATE_SUCCESS_TITLE: 'Адміністратора оновлено',
  DELETE_SUCCESS_TITLE: 'Адміністратора видалено',
} as const;

export const ADMINS_CREATE_ICON = 'add';
export const ADMINS_CARD_ICON = 'person';
export const ADMINS_ROLE_ICON = 'shield_person';
export const ADMINS_SHOPS_ICON = 'storefront';
export const ADMINS_PAGE_SIZE = 10;
export const ADMINS_IDENTITY_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]+|\+?\d{10,15})$/;
/** An identity containing this character is an email, otherwise a phone number. */
export const ADMINS_EMAIL_MARKER = '@';
export const ADMINS_DEFAULT_ROLE_VALUE = 'admin';
export const ADMINS_ROLE_OPTIONS: DropdownOption[] = [
  { label: ADMINS_TEXTS.DEFAULT_ROLE, value: ADMINS_DEFAULT_ROLE_VALUE },
  { label: ADMINS_TEXTS.SUPER_ROLE, value: 'super' },
];

export const ADMINS_IDENTITY_FIELD_ID = 'admin-identity';
