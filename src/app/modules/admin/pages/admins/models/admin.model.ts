import { PaginationMeta } from '@core/models/pagination-meta.model';

export type AdminShopApiItem = {
  id?: string | number | null;
  name?: string | null;
  description?: string | null;
  url?: string | null;
};

export type AdminRoleApiItem = {
  id?: string | null;
  name?: string | null;
  description?: string | null;
};

export type AdminApiItem = {
  id?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobileNumber?: string | null;
  shopIds?: (string | number)[] | null;
  shops?: (string | number | AdminShopApiItem)[] | null;
  role?: string | AdminRoleApiItem | null;
};

/** The list endpoint has used several envelope keys; any of them may carry the items. */
export type AdminsApiResponse = Partial<PaginationMeta> & {
  admins?: AdminApiItem[] | null;
  data?: AdminApiItem[] | null;
  items?: AdminApiItem[] | null;
};

/** Empty strings mean "unknown"; display fallbacks are applied by the card mapping. */
export type Admin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  shopIds: string[];
};
