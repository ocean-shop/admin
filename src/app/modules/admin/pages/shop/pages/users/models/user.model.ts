export type UserOtpApiItem = {
  channel?: string | null;
  purpose?: string | null;
  attempts?: number | null;
  [key: string]: unknown;
};

export type UserSessionApiItem = {
  userAgent?: string | null;
  user_agent?: string | null;
  ipAddress?: string | null;
  ip_address?: string | null;
  deviceName?: string | null;
  device_name?: string | null;
  [key: string]: unknown;
};

export type UserRoleApiItem = {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  [key: string]: unknown;
};

export type UserApiItem = {
  id?: string | null;
  shopId?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  mobileNumber?: string | null;
  mobile_number?: string | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
  createdAt?: string | null;
  created_at?: string | null;
  otps?: UserOtpApiItem[] | null;
  sessions?: UserSessionApiItem[] | null;
  role?: UserRoleApiItem | string | null;
  [key: string]: unknown;
};

export type UserListResponse = {
  items: UserApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UserListQueryParams = {
  page: number;
  limit: number;
  shopId: string;
  email?: string;
  phoneNumber?: string;
  sortOrder?: 'asc' | 'desc';
};

export type User = {
  id: string;
  email: string;
  mobileNumber: string;
  isActive: string;
  createdAt: string;
};
