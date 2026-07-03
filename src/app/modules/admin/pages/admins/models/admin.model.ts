export interface AdminApiItem {
  id?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobileNumber?: string | null;
  role?:
    | string
    | {
        id?: string | null;
        name?: string | null;
        description?: string | null;
      }
    | null;
}

export interface AdminsApiResponse {
  admins?: AdminApiItem[] | null;
  data?: AdminApiItem[] | null;
  items?: AdminApiItem[] | null;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface AdminsQueryParams {
  page: number;
  limit: number;
}

export interface AdminsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}
