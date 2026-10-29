export const SHOPS_TEXTS = {
  PAGE_TITLE: 'Магазини',
  CREATE_LABEL: 'Створити Магазин',
  EMPTY_STATE: 'Не знайдено магазинів.',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити магазини. Спробуйте ще раз.',
  OPTION_FALLBACK_PREFIX: 'Магазин',
  CREATED_BADGE_PREFIX: 'Створено:',
  PAGINATION_LABEL: 'магазинів',
  MODAL_CREATE_TITLE: 'Створити Магазин',
  MODAL_UPDATE_TITLE: 'Оновити Магазин',
  MODAL_DELETE_TITLE: 'Видалити Магазин',
  MODAL_CREATE_CONFIRM_LABEL: 'Створити',
  MODAL_UPDATE_CONFIRM_LABEL: 'Оновити',
  MODAL_DELETE_CONFIRM_LABEL: 'Видалити',
  MODAL_DELETE_MESSAGE: 'Ви впевнені, що хочете видалити магазин',
  MODAL_DELETE_SUFFIX: '? Цю дію не можна скасувати.',
  NAME_LABEL: 'Назва магазину',
  NAME_PLACEHOLDER: 'Введіть назву магазину',
  NAME_REQUIRED_MESSAGE: "Назва магазину обов'язкова",
  DESCRIPTION_LABEL: 'Опис',
  DESCRIPTION_PLACEHOLDER: 'Введіть опис магазину',
  URL_LABEL: 'URL',
  URL_PLACEHOLDER: 'https://example.com',
  URL_INVALID_MESSAGE: 'Введіть дійсний URL',
  CREATE_SUCCESS_TITLE: 'Магазин створено',
  UPDATE_SUCCESS_TITLE: 'Магазин оновлено',
  DELETE_SUCCESS_TITLE: 'Магазин видалено',
} as const;

export const SHOPS_CREATE_ICON = 'add';
export const SHOPS_CARD_ICON = 'store';
export const SHOPS_PAGE_SIZE = 10;
/** Page size used when loading every shop for pickers. */
export const SHOPS_ALL_PAGE_SIZE = 100;
export const SHOPS_URL_PATTERN = /^(|https?:\/\/.+)$/i;
/** `YYYY-MM-DD` part of an ISO date. */
export const SHOPS_DATE_LENGTH = 10;

export const SHOPS_NAME_FIELD_ID = 'shop-name';
export const SHOPS_DESCRIPTION_FIELD_ID = 'shop-description';
export const SHOPS_URL_FIELD_ID = 'shop-url';
