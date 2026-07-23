export type AdminCreatePayload = {
  email?: string;
  mobileNumber?: string;
  role: string;
  shopIds?: string[];
};

export type AdminUpdatePayload = {
  email?: string;
  mobileNumber?: string;
  role: string;
  shopIds?: string[];
};
