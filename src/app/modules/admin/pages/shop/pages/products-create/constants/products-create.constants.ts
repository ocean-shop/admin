import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
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
  UPDATE_SUCCESS_TITLE: 'Товар оновлено',
  UPDATE_ERROR_TITLE: 'Товар не оновлено',
  UPDATE_ERROR_MESSAGE: 'Не вдалося зберегти зміни. Спробуйте ще раз.',
  CATEGORIES_LOAD_ERROR_TITLE: 'Категорії не завантажено',
  CATEGORIES_LOAD_ERROR_MESSAGE: 'Оновіть сторінку та спробуйте ще раз.',
  CATEGORY_ASSIGN_SUCCESS_TITLE: 'Категорію прив’язано',
  CATEGORY_UNASSIGN_SUCCESS_TITLE: 'Категорію відв’язано',
  CATEGORY_ASSIGN_ERROR_TITLE: 'Частину категорій не прив’язано',
  CATEGORY_ASSIGN_ERROR_MESSAGE: 'Не вдалося зберегти категорію. Спробуйте ще раз.',
  ATTRIBUTE_ASSIGN_SUCCESS_TITLE: 'Атрибут прив’язано',
  ATTRIBUTE_UNASSIGN_SUCCESS_TITLE: 'Атрибут відв’язано',
  ATTRIBUTE_ASSIGN_ERROR_TITLE: 'Не вдалося оновити атрибут',
  ATTRIBUTE_ASSIGN_ERROR_MESSAGE: 'Спробуйте ще раз через кілька секунд.',
  TAG_ASSIGN_SUCCESS_TITLE: 'Тег прив’язано',
  TAG_UNASSIGN_SUCCESS_TITLE: 'Тег відв’язано',
  TAG_ASSIGN_ERROR_TITLE: 'Не вдалося оновити тег',
  TAG_ASSIGN_ERROR_MESSAGE: 'Спробуйте ще раз через кілька секунд.',
};

export const PRODUCTS_CREATE_FIELD_IDS = PRODUCT_FORM_FIELD_IDS;
export const PRODUCTS_CREATE_STATUS_OPTIONS = PRODUCT_FORM_STATUS_OPTIONS;
export const PRODUCTS_CREATE_DEFAULT_FORM_VALUE = PRODUCT_FORM_DEFAULT_VALUE;
