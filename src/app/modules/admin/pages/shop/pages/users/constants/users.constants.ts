import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { TableColumn } from '@ui/table/models/table-column.model';

export const USERS_TEXTS = {
  USER_OTPS_EMPTY_STATE: 'OTP записи відсутні.',
  USER_SESSIONS_EMPTY_STATE: 'Сесії користувача відсутні.',
  PAGE_TITLE: 'Користувачі',
  PAGE_DESCRIPTION: 'Переглядайте користувачів магазину та відкривайте детальну інформацію.',
  EMAIL_FILTER_LABEL: 'Email',
  EMAIL_FILTER_PLACEHOLDER: 'Введіть email',
  PHONE_FILTER_LABEL: 'Номер телефону',
  PHONE_FILTER_PLACEHOLDER: 'Введіть номер телефону',
  FILTER_APPLY_LABEL: 'Застосувати',
  FILTER_RESET_LABEL: 'Скинути',
  SORT_LABEL: 'Сортування',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте сторінку з коректним шляхом магазину (/shop/:shopId/users), щоб керувати користувачами.',
  EMPTY_STATE: 'Користувачів не знайдено.',
  TABLE_LOADING_TEXT: 'Завантаження користувачів...',
  EMAIL_LABEL: 'Email',
  MOBILE_NUMBER_LABEL: 'Телефон',
  IS_ACTIVE_LABEL: 'Активний',
  CREATED_AT_LABEL: 'Створено',
  OTP_CHANNEL_LABEL: 'Канал',
  OTP_PURPOSE_LABEL: 'Призначення',
  OTP_ATTEMPTS_LABEL: 'Спроби',
  SESSION_USER_AGENT_LABEL: 'User agent',
  SESSION_IP_ADDRESS_LABEL: 'IP-адреса',
  SESSION_DEVICE_NAME_LABEL: 'Пристрій',
  ROLE_VALUE_LABEL: 'Значення',
  TABLE_ACTIONS_LABEL: 'Дії',
  TABLE_SHOW_LABEL: 'Переглянути користувача',
  PAGINATION_LABEL: 'користувачів',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити користувачів. Спробуйте ще раз.',
  DETAILS_TITLE: 'Деталі користувача',
  DETAILS_DESCRIPTION: 'Перегляд інформації користувача, OTP, сесій та ролі.',
  USER_INFO_TITLE: 'Дані користувача',
  USER_OTPS_TITLE: 'OTP-коди',
  USER_SESSIONS_TITLE: 'Сесії',
  USER_ROLE_TITLE: 'Роль',
  USER_DETAIL_LOAD_ERROR: 'Не вдалося завантажити деталі користувача.',
  USER_ROLE_EMPTY_STATE: 'Роль користувача відсутня.',
} as const;

export const USERS_SECTION_PATH = 'users';
export const USERS_PAGE_SIZE = 20;
export const USERS_EMAIL_FILTER_ID = 'users-email-filter';
export const USERS_PHONE_FILTER_ID = 'users-phone-filter';
export const USERS_SORT_ICON = 'swap_vert';
export const USERS_SHOW_ICON = 'visibility';
/** Role object keys hidden from the role section. */
export const USER_ROLE_HIDDEN_FIELDS: readonly string[] = ['id'];

export const USERS_SORT_OPTIONS: DropdownOption[] = [
  { label: 'Спочатку новіші', value: 'newest' },
  { label: 'Спочатку старіші', value: 'older' },
];

export const USERS_TABLE_COLUMNS: TableColumn[] = [
  { key: 'email', header: USERS_TEXTS.EMAIL_LABEL },
  { key: 'mobileNumber', header: USERS_TEXTS.MOBILE_NUMBER_LABEL },
  { key: 'isActive', header: USERS_TEXTS.IS_ACTIVE_LABEL },
  { key: 'createdAt', header: USERS_TEXTS.CREATED_AT_LABEL },
];

export const USER_OTP_TABLE_COLUMNS: TableColumn[] = [
  { key: 'channel', header: USERS_TEXTS.OTP_CHANNEL_LABEL },
  { key: 'purpose', header: USERS_TEXTS.OTP_PURPOSE_LABEL },
  { key: 'attempts', header: USERS_TEXTS.OTP_ATTEMPTS_LABEL, align: 'right' },
];

export const USER_SESSION_TABLE_COLUMNS: TableColumn[] = [
  { key: 'userAgent', header: USERS_TEXTS.SESSION_USER_AGENT_LABEL },
  { key: 'ipAddress', header: USERS_TEXTS.SESSION_IP_ADDRESS_LABEL },
  { key: 'deviceName', header: USERS_TEXTS.SESSION_DEVICE_NAME_LABEL },
];
