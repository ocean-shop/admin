export interface CreateCategoryPayload {
  shopId: string;
  parentId?: string;
  name: string;
  slug: string;
}

export interface UpdateCategoryPayload {
  parentId?: string;
  name?: string;
  slug?: string;
}

export interface CategoryFormSubmitPayload {
  parentId?: string;
  name: string;
  slug: string;
}
