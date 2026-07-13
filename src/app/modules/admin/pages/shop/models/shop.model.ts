export interface ShopApiItem {
  id?: string | number | null;
  name?: string | null;
  description?: string | null;
  url?: string | null;
  created?: string | null;
  updated?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ShopsApiResponse {
  shops?: ShopApiItem[] | null;
  data?: ShopApiItem[] | null;
  items?: ShopApiItem[] | null;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ShopsQueryParams {
  page: number;
  limit: number;
}

export interface ShopsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}
