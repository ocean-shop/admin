import { BadgeTone } from '@ui/badge/models/badge-tone.type';
import { TableColumn } from '@ui/table/models/table-column.model';

export const PRODUCTS_DETAIL_TEXTS = {
  PAGE_TITLE: 'Деталі товару',
  EDIT_LABEL: 'Редагувати',
  SHOP_CONTEXT_REQUIRED_MESSAGE:
    'Відкрийте коректний маршрут магазину (/admin/shop/:shopId/products/:productId), щоб переглянути товар.',
  PRODUCT_LOAD_ERROR:
    'Не вдалося завантажити товар. Поверніться до списку товарів і спробуйте ще раз.',
  LOADING_TEXT: 'Завантаження товару...',
  POPULAR_BADGE: 'Популярний',
  SKU_PREFIX: 'SKU',
  SLUG_PREFIX: '/',
  UPDATED_PREFIX: 'Оновлено',

  OVERVIEW_TITLE: 'Огляд',
  PRICE_LABEL: 'Ціна',
  PRICE_FROM_PREFIX: 'від',
  AVAILABILITY_LABEL: 'Наявність',
  VARIATIONS_AVAILABILITY_LABEL: 'Доступно варіацій',
  VARIATIONS_AVAILABILITY_SEPARATOR: 'з',
  CATEGORY_LABEL: 'Категорія',
  PHOTOS_LABEL: 'Фото',
  AVAILABLE: 'Доступний',
  UNAVAILABLE: 'Немає в наявності',

  GALLERY_EMPTY: 'Фото не додано',
  GALLERY_MAIN_BADGE: 'Головне фото',
  GALLERY_THUMBNAIL_PREFIX: 'Фото',
  GALLERY_THUMBNAILS_LABEL: 'Фото товару',

  DESCRIPTION_TITLE: 'Опис',
  DESCRIPTION_EMPTY: 'Опис не додано.',

  VARIATIONS_TITLE: 'Варіації',
  VARIATIONS_EMPTY: 'Варіацій поки немає.',
  VARIATION_MAIN_SUFFIX: '(основна)',
  VARIATION_TITLE_HEADER: 'Варіація',
  VARIATION_ATTRIBUTES_HEADER: 'Атрибути',
  VARIATION_SKU_HEADER: 'SKU',
  VARIATION_PRICE_HEADER: 'Ціна',
  VARIATION_OLD_PRICE_HEADER: 'Стара ціна',
  VARIATION_AVAILABILITY_HEADER: 'Наявність',

  PRICING_TITLE: 'Ціна та запаси',
  OLD_PRICE_LABEL: 'Стара ціна (знижка)',
  SKU_LABEL: 'SKU',

  SEO_TITLE: 'SEO',
  SEO_MISSING_PREFIX: 'Не заповнено:',
  SEO_SLUG_LABEL: 'Слаг (URL)',
  SEO_META_TITLE_LABEL: 'Meta title',
  SEO_META_DESCRIPTION_LABEL: 'Meta description',
  SEO_CANONICAL_LABEL: 'Canonical URL',
  SEO_INDEXING_LABEL: 'Індексація',
  SEO_NOT_FILLED: 'Не заповнено',
  SEO_INDEXED: 'Індексується',
  SEO_NOT_INDEXED: 'Не індексується',

  STATUS_TITLE: 'Статус і видимість',
  STATUS_LABEL: 'Статус',
  TYPE_LABEL: 'Тип товару',
  POPULAR_LABEL: 'Популярний',
  MAIN_BANNER_LABEL: 'Головний банер',
  CREATED_LABEL: 'Створено',
  UPDATED_LABEL: 'Оновлено',

  CATEGORIES_TITLE: 'Категорії',
  CATEGORIES_EMPTY: 'Категорії не призначено.',
  TAGS_TITLE: 'Теги',
  TAGS_EMPTY: 'Теги не призначено.',
  ATTRIBUTES_TITLE: 'Атрибути',
  ATTRIBUTES_EMPTY: 'Атрибути не призначено.',

  RELATED_TITLE: 'Супутні товари',
  RELATED_EMPTY: 'Супутні товари не додано.',
  RELATED_HINT: 'Показуються на сторінці товару в цьому порядку.',
} as const;

export const PRODUCTS_DETAIL_ICONS = {
  EDIT: 'edit',
  OVERVIEW: 'inventory_2',
  DESCRIPTION: 'description',
  VARIATIONS: 'style',
  PRICING: 'payments',
  SEO: 'travel_explore',
  STATUS: 'toggle_on',
  CATEGORIES: 'account_tree',
  TAGS: 'sell',
  ATTRIBUTES: 'tune',
  RELATED: 'link',
  IMAGE_PLACEHOLDER: 'image',
} as const;

/** SEO fields counted as "not filled" (the storefront falls back to the name / description). */
export const PRODUCTS_DETAIL_SEO_META_FIELDS = ['metaTitle', 'metaDescription'] as const;

export const PRODUCTS_DETAIL_HEADER_SEPARATOR = ' · ';
export const PRODUCTS_DETAIL_GALLERY_POSITION_SEPARATOR = ' / ';

export const PRODUCTS_DETAIL_AVAILABILITY_TONES: Record<string, BadgeTone> = {
  [PRODUCTS_DETAIL_TEXTS.AVAILABLE]: 'success',
  [PRODUCTS_DETAIL_TEXTS.UNAVAILABLE]: 'neutral',
};

export const PRODUCTS_DETAIL_VARIATION_COLUMNS: TableColumn[] = [
  {
    key: 'title',
    header: PRODUCTS_DETAIL_TEXTS.VARIATION_TITLE_HEADER,
    emphasis: true,
    thumbnailKey: 'image',
  },
  { key: 'attributes', header: PRODUCTS_DETAIL_TEXTS.VARIATION_ATTRIBUTES_HEADER },
  { key: 'sku', header: PRODUCTS_DETAIL_TEXTS.VARIATION_SKU_HEADER, mono: true },
  { key: 'price', header: PRODUCTS_DETAIL_TEXTS.VARIATION_PRICE_HEADER, align: 'right' },
  { key: 'oldPrice', header: PRODUCTS_DETAIL_TEXTS.VARIATION_OLD_PRICE_HEADER, align: 'right' },
  {
    key: 'availability',
    header: PRODUCTS_DETAIL_TEXTS.VARIATION_AVAILABILITY_HEADER,
    badgeTones: PRODUCTS_DETAIL_AVAILABILITY_TONES,
  },
];
