export type AttributeApiItem = {
  id?: string | null;
  shopId?: string | null;
  name?: string | null;
  value?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AttributeListResponse = {
  items: AttributeApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AttributeListQueryParams = {
  page: number;
  limit: number;
  shopId: string;
  name?: string;
};

export type Attribute = {
  id: string;
  shopId: string;
  name: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
};
