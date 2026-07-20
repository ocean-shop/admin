export interface AttributeApiItem {
  id?: string | null;
  shopId?: string | null;
  name?: string | null;
  value?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AttributeListResponse {
  items: AttributeApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AttributeListQueryParams {
  page: number;
  limit: number;
  shopId: string;
  name?: string;
}

export interface Attribute {
  id: string;
  shopId: string;
  name: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}
