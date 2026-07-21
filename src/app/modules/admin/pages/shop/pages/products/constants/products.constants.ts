import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

export const PRODUCTS_TEXTS = {
  PAGE_TITLE: 'Продукти',
  PAGE_DESCRIPTION: 'Керуйте продуктами магазину, фільтруйте список і змінюйте сортування.',
  CREATE_LABEL: 'Додати продукт',
  NAME_FILTER_LABEL: 'Назва',
  NAME_FILTER_PLACEHOLDER: 'Введіть назву продукту',
  SKU_FILTER_LABEL: 'SKU',
  SKU_FILTER_PLACEHOLDER: 'Введіть SKU',
  CATEGORY_FILTER_LABEL: 'Категорії',
  FILTER_APPLY_LABEL: 'Застосувати',
  FILTER_RESET_LABEL: 'Скинути',
  SORT_LABEL: 'Сортування',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте сторінку з коректним шляхом магазину (/shop/:shopId/products), щоб керувати продуктами.',
  EMPTY_STATE: 'Продукти не знайдено.',
  TABLE_LOADING_TEXT: 'Завантаження продуктів...',
  TABLE_TITLE_HEADER: 'Назва',
  TABLE_SKU_HEADER: 'SKU',
  TABLE_TYPE_HEADER: 'Тип',
  TABLE_STATUS_HEADER: 'Статус',
  TABLE_PRICE_HEADER: 'Ціна',
  TABLE_CATEGORIES_HEADER: 'Категорії',
  PAGINATION_LABEL: 'продуктів',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити продукти. Спробуйте ще раз.',
};

export const PRODUCTS_CREATE_ICON = 'add';
export const PRODUCTS_PAGE_SIZE = 20;
export const PRODUCTS_NAME_FILTER_ID = 'products-name-filter';
export const PRODUCTS_SKU_FILTER_ID = 'products-sku-filter';

export const PRODUCTS_SORT_OPTIONS: DropdownOption[] = [
  { label: 'Спочатку новіші', value: 'newest' },
  { label: 'Спочатку старіші', value: 'older' },
  { label: 'За алфавітом', value: 'alphabet' },
];
