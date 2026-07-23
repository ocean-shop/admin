export type ShopCreatePayload = {
  name: string;
  description?: string;
  url?: string;
};

export type ShopUpdatePayload = {
  name?: string;
  description?: string;
  url?: string;
};
