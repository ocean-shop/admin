import { uniqueBy } from '@core/helpers/array.helper';
import { normalizePaginationMeta } from '@core/helpers/pagination.helper';
import { toTrimmedString } from '@core/helpers/value-format.helper';
import { PaginatedResponse } from '@core/models/paginated-response.model';
import { PaginationQuery } from '@core/models/pagination-query.model';
import { EntityCardData } from '@ui/entity-card/models/entity-card.model';
import { ADMINS_TEXTS } from '../constants/admins.constants';
import { Admin, AdminApiItem, AdminsApiResponse } from '../models/admin.model';
import { AdminShop } from '../models/admin-shop.model';

export const extractAdminItems = (response: AdminsApiResponse | AdminApiItem[]): AdminApiItem[] =>
  Array.isArray(response) ? response : (response.items ?? response.admins ?? response.data ?? []);

/** Shops of the admin from `shops` (ids or objects) and `shopIds`, unique by id; names may be empty. */
export const extractAdminShops = (admin: AdminApiItem): AdminShop[] => {
  const fromShops = (admin.shops ?? []).map((shop) =>
    typeof shop === 'object'
      ? { id: toTrimmedString(shop.id), name: shop.name?.trim() ?? '' }
      : { id: toTrimmedString(shop), name: '' },
  );
  const fromShopIds = (admin.shopIds ?? []).map((id) => ({ id: toTrimmedString(id), name: '' }));

  return uniqueBy(
    [...fromShops, ...fromShopIds].filter((shop) => shop.id),
    (shop) => shop.id,
  );
};

const resolveAdminName = (admin: AdminApiItem): string => {
  const fullName = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim();
  return admin.fullName?.trim() || admin.name?.trim() || fullName;
};

export const mapAdmin = (admin: AdminApiItem): Admin => ({
  id: toTrimmedString(admin.id) || crypto.randomUUID(),
  name: resolveAdminName(admin),
  email: admin.email?.trim() ?? '',
  phone: admin.phone?.trim() || admin.mobileNumber?.trim() || '',
  role: (typeof admin.role === 'string' ? admin.role : admin.role?.name)?.trim() ?? '',
  shopIds: extractAdminShops(admin).map((shop) => shop.id),
});

export const mapAdminsResponse = (
  response: AdminsApiResponse | AdminApiItem[],
  query: PaginationQuery,
): PaginatedResponse<Admin> => {
  const items = extractAdminItems(response).map(mapAdmin);
  const meta = Array.isArray(response) ? null : response;
  return { items, ...normalizePaginationMeta(meta, items.length, query) };
};

export const mapAdminToCard = (admin: Admin): EntityCardData => ({
  id: admin.id,
  title: admin.name || ADMINS_TEXTS.DEFAULT_NAME,
  subtitle: admin.email || ADMINS_TEXTS.DEFAULT_EMAIL,
  detail: admin.phone || ADMINS_TEXTS.DEFAULT_PHONE,
  badge: admin.role || ADMINS_TEXTS.DEFAULT_ROLE,
});
