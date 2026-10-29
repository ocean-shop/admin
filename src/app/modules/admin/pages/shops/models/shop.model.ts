import { PaginationMeta } from '@core/models/pagination-meta.model';

export type ShopApiItem = {
  id?: string | number | null;
  name?: string | null;
  description?: string | null;
  url?: string | null;
  created?: string | null;
  updated?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

/** The list endpoint has used several envelope keys; any of them may carry the items. */
export type ShopsApiResponse = Partial<PaginationMeta> & {
  shops?: ShopApiItem[] | null;
  data?: ShopApiItem[] | null;
  items?: ShopApiItem[] | null;
};

export type Shop = {
  id: string;
  name: string;
  description: string;
  url: string;
  createdAt: string;
};
