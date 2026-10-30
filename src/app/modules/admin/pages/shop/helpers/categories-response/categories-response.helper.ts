import {
  CategoriesApiResponse,
  CategoryApiItem,
} from '../../pages/categories/models/category.model';

/** The categories endpoint returns either a bare array or one of several envelope shapes. */
export const extractCategoriesFromResponse = (
  response: CategoriesApiResponse | CategoryApiItem[] | null | undefined,
): CategoryApiItem[] => {
  if (Array.isArray(response)) {
    return response;
  }

  const candidates = [response?.items, response?.categories, response?.data];
  return candidates.find((candidate) => Array.isArray(candidate)) ?? [];
};
