export type TagApiItem = {
  id?: string | null;
  shopId?: string | null;
  name?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type TagListResponse = {
  items: TagApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TagListQueryParams = {
  page: number;
  limit: number;
  shopId: string;
  name?: string;
};

export type Tag = {
  id: string;
  shopId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};
