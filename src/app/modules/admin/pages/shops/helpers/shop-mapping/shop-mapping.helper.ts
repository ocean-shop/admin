import { APP_ROUTES } from '@core/constants/routes.constants';
import { normalizePaginationMeta } from '@core/helpers/pagination/pagination.helper';
import { toTrimmedString } from '@core/helpers/value-format/value-format.helper';
import { PaginatedResponse } from '@core/models/paginated-response.model';
import { PaginationQuery } from '@core/models/pagination-query.model';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { EntityCardData } from '@ui/entity-card/models/entity-card.model';
import { SHOPS_DATE_LENGTH, SHOPS_TEXTS } from '../../constants/shops.constants';
import { Shop, ShopApiItem, ShopsApiResponse } from '../../models/shop.model';

export const extractShopItems = (response: ShopsApiResponse | ShopApiItem[]): ShopApiItem[] =>
  Array.isArray(response) ? response : (response.items ?? response.shops ?? response.data ?? []);

export const mapShop = (shop: ShopApiItem): Shop => ({
  id: toTrimmedString(shop.id) || crypto.randomUUID(),
  name: shop.name?.trim() ?? '',
  description: shop.description?.trim() ?? '',
  url: shop.url?.trim() ?? '',
  createdAt: shop.createdAt?.trim() || shop.created?.trim() || '',
});

export const mapShopsResponse = (
  response: ShopsApiResponse | ShopApiItem[],
  query: PaginationQuery,
): PaginatedResponse<Shop> => {
  const items = extractShopItems(response).map(mapShop);
  const meta = Array.isArray(response) ? null : response;
  return { items, ...normalizePaginationMeta(meta, items.length, query) };
};

/** "Створено: YYYY-MM-DD"; empty for missing or unparsable dates. */
export const formatShopCreatedBadge = (createdAt: string): string => {
  const date = new Date(createdAt);
  if (!createdAt || Number.isNaN(date.getTime())) {
    return '';
  }

  return `${SHOPS_TEXTS.CREATED_BADGE_PREFIX} ${date.toISOString().slice(0, SHOPS_DATE_LENGTH)}`;
};

export const mapShopToCard = (shop: Shop): EntityCardData => ({
  id: shop.id,
  title: shop.name,
  subtitle: shop.description,
  detail: shop.url,
  badge: formatShopCreatedBadge(shop.createdAt),
  titleLink: `${APP_ROUTES.ADMIN_SHOP}/${shop.id}`,
});

/** Unique shops sorted by name; nameless shops get a fallback label with their id. */
export const mapShopOptions = (shops: ShopApiItem[]): DropdownOption[] => {
  const options = new Map<string, DropdownOption>();
  shops.forEach((shop) => {
    const id = toTrimmedString(shop.id);
    if (id) {
      const label = shop.name?.trim() || `${SHOPS_TEXTS.OPTION_FALLBACK_PREFIX} ${id}`;
      options.set(id, { value: id, label });
    }
  });

  return Array.from(options.values()).sort((left, right) => left.label.localeCompare(right.label));
};
