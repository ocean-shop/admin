import { Shop, ShopsPagination } from './shop.model';

export type ShopsMappedResponse = {
  shops: Shop[];
  pagination: ShopsPagination;
};
