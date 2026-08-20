import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { TableColumn } from '@ui/table/models/table-column.model';

export const USERS_TEXTS = {
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
  TABLE_EMAIL_HEADER: 'email',
  TABLE_MOBILE_NUMBER_HEADER: 'mobile_number',
  TABLE_IS_ACTIVE_HEADER: 'is_active',
  TABLE_CREATED_AT_HEADER: 'created_at',
  TABLE_ACTIONS_LABEL: 'Дії',
  TABLE_SHOW_LABEL: 'Переглянути користувача',
  PAGINATION_LABEL: 'користувачів',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити користувачів. Спробуйте ще раз.',
  DETAILS_TITLE: 'Деталі користувача',
  DETAILS_DESCRIPTION: 'Перегляд інформації користувача, OTP, сесій та ролі.',
  USER_INFO_TITLE: 'Дані користувача',
  USER_OTPS_TITLE: 'OTPS коди',
  USER_SESSIONS_TITLE: 'Сесії',
  USER_ROLE_TITLE: 'Роль',
  USER_DETAIL_LOAD_ERROR: 'Не вдалося завантажити деталі користувача.',
  USER_ROLE_EMPTY_STATE: 'Роль користувача відсутня.',
};

export const USERS_PAGE_SIZE = 20;
export const USERS_EMAIL_FILTER_ID = 'users-email-filter';
export const USERS_PHONE_FILTER_ID = 'users-phone-filter';

export const USERS_SORT_OPTIONS: DropdownOption[] = [
  { label: 'Спочатку новіші', value: 'newest' },
  { label: 'Спочатку старіші', value: 'older' },
];

export const USERS_TABLE_COLUMNS: TableColumn[] = [
  { key: 'email', header: USERS_TEXTS.TABLE_EMAIL_HEADER },
  { key: 'mobile_number', header: USERS_TEXTS.TABLE_MOBILE_NUMBER_HEADER },
  { key: 'is_active', header: USERS_TEXTS.TABLE_IS_ACTIVE_HEADER },
  { key: 'created_at', header: USERS_TEXTS.TABLE_CREATED_AT_HEADER },
];
