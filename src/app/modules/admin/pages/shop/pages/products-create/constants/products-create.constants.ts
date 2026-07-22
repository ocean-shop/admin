import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATIC_ATTRIBUTES,
  PRODUCT_FORM_STATIC_CATEGORIES,
  PRODUCT_FORM_STATIC_TAGS,
  PRODUCT_FORM_STATUS_OPTIONS,
  PRODUCT_FORM_TEXTS,
} from '../../../components/product-form/constants/product-form.constants';

export const PRODUCTS_CREATE_TEXTS = {
  PAGE_TITLE: 'Добавити новий товар',
  PAGE_DESCRIPTION: 'Додайте нову позицію до прибережного каталогу.',
  CREATE_LABEL: 'Добавити товар',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте коректний маршрут магазину (/admin/shop/:shopId/products/create), щоб створити товар.',
  ...PRODUCT_FORM_TEXTS,
  CREATE_SUCCESS_TITLE: 'Товар створено',
  CREATE_ERROR_TITLE: 'Товар не створено',
  CREATE_ERROR_MESSAGE: 'Перевірте форму та спробуйте ще раз.',
};

export const PRODUCTS_CREATE_FIELD_IDS = PRODUCT_FORM_FIELD_IDS;
export const PRODUCTS_CREATE_STATUS_OPTIONS = PRODUCT_FORM_STATUS_OPTIONS;
export const PRODUCTS_CREATE_STATIC_CATEGORIES = PRODUCT_FORM_STATIC_CATEGORIES;
export const PRODUCTS_CREATE_STATIC_ATTRIBUTES = PRODUCT_FORM_STATIC_ATTRIBUTES;
export const PRODUCTS_CREATE_STATIC_TAGS = PRODUCT_FORM_STATIC_TAGS;
export const PRODUCTS_CREATE_DEFAULT_FORM_VALUE = PRODUCT_FORM_DEFAULT_VALUE;
