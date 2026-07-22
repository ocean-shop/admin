import { PRODUCT_FORM_TEXTS } from '../../../components/product-form/constants/product-form.constants';

export const PRODUCTS_UPDATE_TEXTS = {
  PAGE_TITLE: 'Оновити товар',
  PAGE_DESCRIPTION: 'Редагуйте деталі товару та підтримуйте каталог актуальним.',
  UPDATE_LABEL: 'Оновити товар',
  SHOP_CONTEXT_REQUIRED_MESSAGE:
    'Відкрийте коректний маршрут магазину (/admin/shop/:shopId/products/:productId/update), щоб оновити товар.',
  PRODUCT_NOT_FOUND_TITLE: 'Товар не знайдено',
  PRODUCT_NOT_FOUND_MESSAGE: 'Поверніться до списку товарів і спробуйте ще раз.',
  UPDATE_SUCCESS_TITLE: 'Товар оновлено',
  UPDATE_ERROR_TITLE: 'Товар не оновлено',
  UPDATE_ERROR_MESSAGE: 'Перевірте форму та спробуйте ще раз.',
  ...PRODUCT_FORM_TEXTS,
};
