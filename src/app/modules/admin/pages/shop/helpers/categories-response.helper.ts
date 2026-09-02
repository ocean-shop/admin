import { CategoriesApiResponse, CategoryApiItem } from '../pages/categories/models/category.model';

export const extractCategoriesFromResponse = (
  response: CategoriesApiResponse | CategoryApiItem[],
): CategoryApiItem[] => {
  if (Array.isArray(response)) {
    return response;
  }
  return response.items ?? response.categories ?? response.data ?? [];
};
