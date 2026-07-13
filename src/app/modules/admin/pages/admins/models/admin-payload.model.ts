export interface AdminCreatePayload {
  email?: string;
  mobileNumber?: string;
  role: string;
  shopIds?: string[];
}

export interface AdminUpdatePayload {
  email?: string;
  mobileNumber?: string;
  role: string;
  shopIds?: string[];
}
