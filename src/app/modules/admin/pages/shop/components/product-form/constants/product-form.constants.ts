import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ProductStatus } from '../../../pages/products/models/product-status.enum';
import { ProductType } from '../../../pages/products/models/product-type.enum';
import {
  SEO_META_DESCRIPTION_MAX_LENGTH,
  SEO_META_TITLE_MAX_LENGTH,
} from '../../../constants/seo.constants';
import { ProductFormFieldIds } from '../models/product-form-field-ids.model';
import { ProductFormModel } from '../models/product-form.model';
import { ProductFormTexts } from '../models/product-form-texts.model';

export const PRODUCT_FORM_TEXTS: ProductFormTexts = {
  BASIC_INFORMATION_TITLE: 'Основна інформація',
  PRICING_INVENTORY_TITLE: 'Ціна та запаси',
  PRODUCT_NAME_LABEL: 'Назва товару',
  PRODUCT_NAME_PLACEHOLDER: 'напр. Лляна сорочка Coastal',
  PRODUCT_NAME_REQUIRED: 'Назва товару є обов’язковою.',
  PRODUCT_TYPE_LABEL: 'Тип товару',
  PRODUCT_TYPE_SIMPLE_LABEL: 'Простий',
  PRODUCT_TYPE_VARIABLE_LABEL: 'Варіативний',
  DESCRIPTION_LABEL: 'Опис',
  DESCRIPTION_PLACEHOLDER: 'Введіть опис товару...',
  PRICE_LABEL: 'Ціна ($)',
  PRICE_PLACEHOLDER: '0.00',
  OLD_PRICE_LABEL: 'Стара ціна (знижка)',
  OLD_PRICE_PLACEHOLDER: '0.00',
  SKU_LABEL: 'SKU',
  SKU_PLACEHOLDER: 'напр. CSTL-SHRT-01',
  STATUS_LABEL: 'Статус',
  AVAILABLE_LABEL: 'Доступний',
  IS_POPULAR_LABEL: 'Популярний',
  IS_MAIN_BANNER_LABEL: 'Головний баннер',
  SEO_TITLE: 'SEO',
  SLUG_LABEL: 'Слаг (URL)',
  SLUG_PLACEHOLDER: 'Згенерується з назви, напр. hidrokostium-5-mm',
  SLUG_INVALID: 'Лише малі латинські літери, цифри та дефіси.',
  META_TITLE_LABEL: 'Meta title',
  META_TITLE_PLACEHOLDER: 'Заголовок для пошукових систем',
  META_TITLE_TOO_LONG: `Максимум ${SEO_META_TITLE_MAX_LENGTH} символів.`,
  META_DESCRIPTION_LABEL: 'Meta description',
  META_DESCRIPTION_PLACEHOLDER: 'Короткий опис для пошукових систем',
  META_DESCRIPTION_TOO_LONG: `Максимум ${SEO_META_DESCRIPTION_MAX_LENGTH} символів.`,
  CANONICAL_URL_LABEL: 'Canonical URL',
  CANONICAL_URL_PLACEHOLDER: 'https://...',
  CANONICAL_URL_INVALID: 'Введіть коректний URL (http:// або https://).',
  NO_INDEX_LABEL: 'Не індексувати (noindex)',
  CATEGORIES_TITLE: 'Категорії',
  ATTRIBUTES_TITLE: 'Атрибути',
  TAGS_TITLE: 'Теги',
  CATEGORIES_SEARCH_PLACEHOLDER: 'Пошук категорій...',
  ATTRIBUTES_SEARCH_PLACEHOLDER: 'Пошук атрибутів...',
  SIDEBAR_DISABLED_HINT:
    'Спочатку створіть товар, щоб керувати категоріями, варіаціями, атрибутами та тегами.',
  ATTRIBUTES_SEARCH_LOADING: 'Завантаження атрибутів...',
  ATTRIBUTES_SEARCH_EMPTY: 'Атрибути не знайдено.',
  ATTRIBUTES_ASSIGNED_EMPTY: 'Ще немає призначених атрибутів.',
  ATTRIBUTES_REMOVE_LABEL: 'Видалити атрибут',
  TAGS_INPUT_PLACEHOLDER: 'Додати теги...',
  TAGS_SEARCH_LOADING: 'Завантаження тегів...',
  TAGS_SEARCH_EMPTY: 'Теги не знайдено.',
  TAGS_ASSIGNED_EMPTY: 'Ще немає призначених тегів.',
  TAGS_REMOVE_LABEL: 'Видалити тег',
  VARIATION_ATTRIBUTES_REMOVE_LABEL: 'Видалити атрибут варіації',
  IMAGES_TITLE: 'Медіа та файли',
  IMAGES_SUBTITLE: 'Перше зображення буде головним',
  IMAGES_UPLOAD_LABEL: 'Завантажити',
  IMAGES_UPLOAD_LOADING_LABEL: 'Завантаження...',
  IMAGES_DROPZONE_HINT: 'Перетягніть зображення сюди або натисніть для вибору',
  IMAGES_ASSIGNED_EMPTY: 'Ще немає доданих зображень.',
  IMAGE_MOVE_UP_LABEL: 'Перемістити вище',
  IMAGE_MOVE_DOWN_LABEL: 'Перемістити нижче',
  IMAGE_REMOVE_LABEL: 'Видалити зображення',
  VARIATIONS_TITLE: 'Варіації товару',
  VARIATIONS_EMPTY: 'Ще немає доданих варіацій.',
  VARIATION_CARD_TITLE: 'Варіація',
  VARIATION_REMOVE_LABEL: 'Видалити варіацію',
  VARIATION_ADD_BUTTON_LABEL: 'Додати варіацію',
  VARIATION_CREATE_BUTTON_LABEL: 'Додати варіацію',
  VARIATION_CREATE_LOADING_BUTTON_LABEL: 'Збереження...',
  VARIATION_UPDATE_BUTTON_LABEL: 'Оновити варіацію',
  VARIATION_TITLE_LABEL: 'Заголовок',
  VARIATION_TITLE_PLACEHOLDER: 'напр. Варіант для синього кольору',
  VARIATION_NAME_LABEL: 'Назва варіації',
  VARIATION_NAME_PLACEHOLDER: 'напр. Синій / M',
  VARIATION_PRICE_LABEL: 'Ціна ($)',
  VARIATION_PRICE_PLACEHOLDER: '0.00',
  VARIATION_OLD_PRICE_LABEL: 'Стара ціна ($)',
  VARIATION_OLD_PRICE_PLACEHOLDER: '0.00',
  VARIATION_SKU_LABEL: 'SKU варіації',
  VARIATION_SKU_PLACEHOLDER: 'напр. CSTL-SHRT-BL-M',
  VARIATION_AVAILABLE_LABEL: 'Доступна',
  VARIATION_IS_MAIN_LABEL: 'Основна',
  VARIATION_ATTRIBUTES_TITLE: 'Атрибути варіації',
  VARIATION_ATTRIBUTES_SEARCH_PLACEHOLDER: 'Пошук атрибутів варіації...',
  VARIATION_ATTRIBUTES_SEARCH_LOADING: 'Завантаження атрибутів...',
  VARIATION_ATTRIBUTES_SEARCH_EMPTY: 'Атрибути не знайдено.',
  VARIATION_ATTRIBUTES_ASSIGNED_EMPTY: 'Ще немає атрибутів для варіації.',
  VARIATION_IMAGES_TITLE: 'Зображення варіації',
  VARIATION_IMAGES_DROPZONE_HINT: 'Перетягніть зображення для варіації або натисніть для вибору',
  VARIATION_IMAGES_ASSIGNED_EMPTY: 'Ще немає зображень для варіації.',
};

export const PRODUCT_FORM_FIELD_IDS: ProductFormFieldIds = {
  PRODUCT_NAME: 'product-name',
  PRODUCT_DESCRIPTION: 'product-description',
  PRICE: 'product-price',
  OLD_PRICE: 'product-old-price',
  SKU: 'product-sku',
  STATUS: 'product-status',
  TYPE_SIMPLE: 'product-type-simple',
  TYPE_VARIABLE: 'product-type-variable',
  AVAILABLE: 'product-available',
  IS_POPULAR: 'product-is-popular',
  IS_MAIN_BANNER: 'product-is-main-banner',
  SLUG: 'product-slug',
  META_TITLE: 'product-meta-title',
  META_DESCRIPTION: 'product-meta-description',
  CANONICAL_URL: 'product-canonical-url',
  NO_INDEX: 'product-no-index',
};

export const PRODUCT_FORM_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Чернетка', value: ProductStatus.Draft },
  { label: 'Активний', value: ProductStatus.Active },
  { label: 'Архівний', value: ProductStatus.Archived },
];

export const PRODUCT_FORM_TYPE_OPTIONS: RadioGroupOption[] = [
  {
    id: PRODUCT_FORM_FIELD_IDS.TYPE_SIMPLE,
    value: ProductType.Simple,
    label: PRODUCT_FORM_TEXTS.PRODUCT_TYPE_SIMPLE_LABEL,
  },
  {
    id: PRODUCT_FORM_FIELD_IDS.TYPE_VARIABLE,
    value: ProductType.Variable,
    label: PRODUCT_FORM_TEXTS.PRODUCT_TYPE_VARIABLE_LABEL,
  },
];

export const PRODUCT_FORM_DEFAULT_VALUE: ProductFormModel = {
  name: '',
  type: ProductType.Simple,
  description: '',
  price: '',
  oldPrice: '',
  sku: '',
  status: ProductStatus.Draft,
  available: true,
  isPopular: false,
  isMainBanner: false,
  slug: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  noIndex: false,
};

/** Success toasts of the editor sidebar; failures are reported by the global error interceptor. */
export const PRODUCT_FORM_TOAST_TEXTS = {
  CATEGORY_ASSIGN_SUCCESS_TITLE: 'Категорію прив’язано',
  CATEGORY_UNASSIGN_SUCCESS_TITLE: 'Категорію відв’язано',
  ATTRIBUTE_ASSIGN_SUCCESS_TITLE: 'Атрибут прив’язано',
  ATTRIBUTE_UNASSIGN_SUCCESS_TITLE: 'Атрибут відв’язано',
  TAG_ASSIGN_SUCCESS_TITLE: 'Тег прив’язано',
  TAG_UNASSIGN_SUCCESS_TITLE: 'Тег відв’язано',
  IMAGES_ASSIGN_SUCCESS_TITLE: 'Зображення збережено',
  VARIATION_SAVE_SUCCESS_TITLE: 'Варіацію збережено',
} as const;

export const PRODUCT_FORM_SERVICE_NOT_CONFIGURED_ERROR =
  'Product form section service is used before configure().';

export const PRODUCT_FORM_SEARCH_DEBOUNCE_MS = 300;
export const PRODUCT_FORM_SEARCH_QUERY_PAGE = 1;
export const PRODUCT_FORM_SEARCH_QUERY_LIMIT = 20;
/** Key of the single debounced search of the tags / attributes sections. */
export const PRODUCT_FORM_ASSIGNABLE_SEARCH_KEY = 'search';
export const PRODUCT_FORM_IMAGE_ID_PREFIX = 'image';
export const PRODUCT_FORM_VARIATION_LOCAL_ID_PREFIX = 'variation-local';
/** Payload marker the API expects when creating a variation. */
export const PRODUCT_FORM_VARIATION_PAYLOAD_KIND = 'product_variations';
export const PRODUCT_FORM_TAGS_INPUT_ID = 'tags-input';
export const PRODUCT_FORM_ATTRIBUTES_SEARCH_ID = 'attributes-search';
export const PRODUCT_FORM_CATEGORY_CHECKBOX_ID_PREFIX = 'category-';
export const PRODUCT_FORM_TAGS_ICON = 'local_offer';
export const PRODUCT_FORM_ATTRIBUTES_ICON = 'list_alt';
export const PRODUCT_FORM_CATEGORIES_ICON = 'category';
export const PRODUCT_FORM_IMAGES_ICON = 'perm_media';
export const PRODUCT_FORM_VARIATIONS_ICON = 'style';
export const PRODUCT_FORM_IMAGE_ICONS = {
  UPLOAD: 'cloud_upload',
  IMAGE: 'image',
  MOVE_UP: 'keyboard_arrow_up',
  MOVE_DOWN: 'keyboard_arrow_down',
  REMOVE: 'delete',
} as const;
export const PRODUCT_FORM_VARIATION_REMOVE_ICON = 'delete';
/** Prefixes of the per-variation field ids; the variation local id is appended. */
export const PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES = {
  TITLE: 'variation-title-',
  NAME: 'variation-name-',
  PRICE: 'variation-price-',
  OLD_PRICE: 'variation-old-price-',
  SKU: 'variation-sku-',
  AVAILABLE: 'variation-available-',
  IS_MAIN: 'variation-main-',
  ATTRIBUTE_SEARCH: 'variation-attribute-search-',
} as const;
export const PRODUCT_FORM_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
