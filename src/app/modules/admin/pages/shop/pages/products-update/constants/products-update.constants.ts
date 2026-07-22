import { PRODUCT_FORM_TEXTS } from '../../../components/product-form/constants/product-form.constants';

export const PRODUCTS_UPDATE_TEXTS = {
  PAGE_TITLE: 'Оновити товар',
  PAGE_DESCRIPTION: 'Редагуйте деталі товару та підтримуйте каталог актуальним.',
  UPDATE_LABEL: 'Оновити товар',
  SHOP_CONTEXT_REQUIRED_MESSAGE:
    'Відкрийте коректний маршрут магазину (/admin/shop/:shopId/products/:productId/update), щоб оновити товар.',
  PRODUCT_NOT_FOUND_TITLE: 'Товар не знайдено',
  PRODUCT_NOT_FOUND_MESSAGE: 'Поверніться до списку товарів і спробуйте ще раз.',
  CATEGORIES_LOAD_ERROR_TITLE: 'Категорії не завантажено',
  CATEGORIES_LOAD_ERROR_MESSAGE: 'Оновіть сторінку та спробуйте ще раз.',
  CATEGORY_ASSIGN_SUCCESS_TITLE: 'Категорію прив’язано',
  CATEGORY_UNASSIGN_SUCCESS_TITLE: 'Категорію відв’язано',
  CATEGORY_ASSIGN_ERROR_TITLE: 'Не вдалося оновити категорію',
  CATEGORY_ASSIGN_ERROR_MESSAGE: 'Спробуйте ще раз через кілька секунд.',
  UPDATE_SUCCESS_TITLE: 'Товар оновлено',
  UPDATE_ERROR_TITLE: 'Товар не оновлено',
  UPDATE_ERROR_MESSAGE: 'Перевірте форму та спробуйте ще раз.',
  ...PRODUCT_FORM_TEXTS,
};
