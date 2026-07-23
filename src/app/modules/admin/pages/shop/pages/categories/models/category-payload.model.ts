export type CreateCategoryPayload = {
  shopId: string;
  parentId?: string;
  name: string;
  slug: string;
};

export type UpdateCategoryPayload = {
  parentId?: string;
  name?: string;
  slug?: string;
};

export type CategoryFormSubmitPayload = {
  parentId?: string;
  name: string;
  slug: string;
};
