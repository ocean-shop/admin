import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { TableColumn } from '@ui/table/models/table-column.model';
import { ProductStatus } from '../models/product-status.enum';
import { ProductType } from '../models/product-type.enum';

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
  TABLE_ACTIONS_LABEL: 'Дії',
  TABLE_UPDATE_LABEL: 'Оновити продукт',
  TABLE_DELETE_LABEL: 'Видалити продукт',
  MODAL_DELETE_TITLE: 'Видалити продукт',
  MODAL_DELETE_MESSAGE: 'Ви справді хочете видалити продукт ',
  MODAL_DELETE_MESSAGE_SUFFIX: '? Цю дію не можна скасувати.',
  MODAL_DELETE_CONFIRM_LABEL: 'Видалити',
  PAGINATION_LABEL: 'продуктів',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити продукти. Спробуйте ще раз.',
  UNTITLED_PRODUCT: 'Продукт без назви',
} as const;

export const PRODUCTS_SECTION_PATH = 'products';
export const PRODUCTS_CREATE_PATH = 'create';
export const PRODUCTS_UPDATE_PATH = 'update';
export const PRODUCTS_CREATE_ICON = 'add';
export const PRODUCTS_SORT_ICON = 'swap_vert';
export const PRODUCTS_CATEGORY_FILTER_ICON = 'category';
export const PRODUCTS_PAGE_SIZE = 20;
export const PRODUCTS_NAME_FILTER_ID = 'products-name-filter';
export const PRODUCTS_SKU_FILTER_ID = 'products-sku-filter';

export const PRODUCTS_SORT_OPTIONS: DropdownOption[] = [
  { label: 'Спочатку новіші', value: 'newest' },
  { label: 'Спочатку старіші', value: 'older' },
  { label: 'За алфавітом', value: 'alphabet' },
];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.Simple]: 'Простий',
  [ProductType.Variable]: 'Варіативний',
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.Active]: 'Активний',
  [ProductStatus.Draft]: 'Чернетка',
  [ProductStatus.Archived]: 'В архіві',
};

export const PRODUCTS_TABLE_COLUMNS: TableColumn[] = [
  { key: 'title', header: PRODUCTS_TEXTS.TABLE_TITLE_HEADER },
  { key: 'sku', header: PRODUCTS_TEXTS.TABLE_SKU_HEADER },
  { key: 'type', header: PRODUCTS_TEXTS.TABLE_TYPE_HEADER },
  { key: 'status', header: PRODUCTS_TEXTS.TABLE_STATUS_HEADER },
  { key: 'price', header: PRODUCTS_TEXTS.TABLE_PRICE_HEADER, align: 'right' },
  { key: 'categories', header: PRODUCTS_TEXTS.TABLE_CATEGORIES_HEADER },
];
