export type AdminShopApiItem = {
  id?: string | number | null;
  name?: string | null;
  description?: string | null;
  url?: string | null;
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
  role?:
    | string
    | {
        id?: string | null;
        name?: string | null;
        description?: string | null;
      }
    | null;
};

export type AdminsApiResponse = {
  admins?: AdminApiItem[] | null;
  data?: AdminApiItem[] | null;
  items?: AdminApiItem[] | null;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type AdminsQueryParams = {
  page: number;
  limit: number;
};

export type AdminsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  shopIds: string[];
};
