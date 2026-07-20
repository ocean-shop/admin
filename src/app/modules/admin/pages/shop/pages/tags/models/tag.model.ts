export interface TagApiItem {
  id?: string | null;
  shopId?: string | null;
  name?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TagListResponse {
  items: TagApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TagListQueryParams {
  page: number;
  limit: number;
  shopId: string;
  name?: string;
}

export interface Tag {
  id: string;
  shopId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
