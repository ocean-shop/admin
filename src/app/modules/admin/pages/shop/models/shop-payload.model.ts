export interface ShopCreatePayload {
  name: string;
  description?: string;
  url?: string;
}

export interface ShopUpdatePayload {
  name?: string;
  description?: string;
  url?: string;
}
