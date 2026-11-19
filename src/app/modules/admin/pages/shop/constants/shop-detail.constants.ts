import { ShopDetailSection } from '../models/shop-detail-section.model';

export const SHOP_DETAIL_TEXTS = {
  PAGE_TITLE: 'Огляд магазину',
  PAGE_DESCRIPTION:
    'Оберіть розділ, щоб керувати контентом магазину: структурою каталогу, фільтрами та продуктами.',
};

export const SHOP_DETAIL_ROUTE_PREFIX = '/admin/shop';
export const SHOP_DETAIL_SHOP_ID_PLACEHOLDER = ':shopId';

export const SHOP_DETAIL_SECTIONS: ShopDetailSection[] = [
  {
    segment: 'categories',
    icon: 'account_tree',
    title: 'Категорії',
    description: 'Створюйте та впорядковуйте дерево категорій для зручної навігації у магазині.',
    linkLabel: 'Перейти до категорій',
  },
  {
    segment: 'tags',
    icon: 'sell',
    title: 'Теги',
    description: 'Додавайте теги для кращого пошуку, сегментації товарів і швидкої фільтрації.',
    linkLabel: 'Перейти до тегів',
  },
  {
    segment: 'attributes',
    icon: 'tune',
    title: 'Атрибути',
    description: 'Налаштовуйте атрибути для варіацій товарів і детальнішого опису характеристик.',
    linkLabel: 'Перейти до атрибутів',
  },
  {
    segment: 'products',
    icon: 'inventory_2',
    title: 'Продукти',
    description: "Керуйте списком продуктів, їх статусами, цінами та прив'язкою до категорій.",
    linkLabel: 'Перейти до продуктів',
  },
  {
    segment: 'orders',
    icon: 'receipt_long',
    title: 'Замовлення',
    description: 'Переглядайте замовлення магазину, перевіряйте статуси оплати та виконання.',
    linkLabel: 'Перейти до замовлень',
  },
  {
    segment: 'quick-orders',
    icon: 'bolt',
    title: 'Швидкі замовлення',
    description: 'Обробляйте заявки «Купити в один клік»: телефонуйте клієнтам і змінюйте статуси.',
    linkLabel: 'Перейти до швидких замовлень',
  },
  {
    segment: 'settings',
    icon: 'settings',
    title: 'Налаштування',
    description: 'Вмикайте функції вітрини й налаштовуйте кольори, які бачать покупці.',
    linkLabel: 'Перейти до налаштувань',
  },
];
