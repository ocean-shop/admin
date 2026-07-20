export interface CategoryApiItem {
  id?: string | number | null;
  parentId?: string | number | null;
  name?: string | null;
  slug?: string | null;
  sort?: number | null;
  productCount?: number | null;
  productsCount?: number | null;
  itemsCount?: number | null;
}

export interface CategoriesApiResponse {
  categories?: CategoryApiItem[] | null;
  items?: CategoryApiItem[] | null;
  data?: CategoryApiItem[] | null;
  totalCategories?: number;
  deepestLevel?: number;
}

export interface Category {
  id: string;
  parentId?: string;
  name: string;
  slug: string;
  sort: number;
  productCount?: number;
}

export interface CategoriesStats {
  totalCategories?: number;
  deepestLevel?: number;
}
