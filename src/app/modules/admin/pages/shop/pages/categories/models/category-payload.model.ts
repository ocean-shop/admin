export type CategorySeoPayload = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
};

export type CreateCategoryPayload = CategorySeoPayload & {
  shopId: string;
  parentId?: string;
  name: string;
  slug: string;
};

export type UpdateCategoryPayload = CategorySeoPayload & {
  parentId?: string;
  name?: string;
  slug?: string;
};

export type CategoryFormSubmitPayload = CategorySeoPayload & {
  parentId?: string;
  name: string;
  slug: string;
};

export type UpdateCategoryVariables = {
  id: string;
  payload: UpdateCategoryPayload;
};
