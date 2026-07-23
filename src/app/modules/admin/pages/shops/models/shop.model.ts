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

export type ShopsApiResponse = {
  shops?: ShopApiItem[] | null;
  data?: ShopApiItem[] | null;
  items?: ShopApiItem[] | null;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type ShopsQueryParams = {
  page: number;
  limit: number;
};

export type ShopsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Shop = {
  id: string;
  name: string;
  description?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
};
