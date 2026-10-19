export type CategoryApiItem = {
  id?: string | number | null;
  parentId?: string | number | null;
  name?: string | null;
  slug?: string | null;
  sort?: number | null;
  productCount?: number | null;
  productsCount?: number | null;
  itemsCount?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
};

export type CategoriesApiResponse = {
  categories?: CategoryApiItem[] | null;
  items?: CategoryApiItem[] | null;
  data?: CategoryApiItem[] | null;
  totalCategories?: number;
  deepestLevel?: number;
};

export type Category = {
  id: string;
  parentId?: string;
  name: string;
  slug: string;
  sort: number;
  productCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
};

export type CategoriesStats = {
  totalCategories?: number;
  deepestLevel?: number;
};
