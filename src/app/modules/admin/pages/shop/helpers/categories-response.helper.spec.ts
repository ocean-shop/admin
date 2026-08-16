import { extractCategoriesFromResponse } from './categories-response.helper';
import { CategoryApiItem } from '../pages/categories/models/category.model';

describe('categories-response.helper', () => {
  const sampleCategories: CategoryApiItem[] = [
    { id: 'cat-1', name: 'Cat 1' },
    { id: 'cat-2', name: 'Cat 2' },
  ];

  it('returns categories when response is already an array', () => {
    expect(extractCategoriesFromResponse(sampleCategories)).toEqual(sampleCategories);
  });

  it('prefers items over other keys', () => {
    expect(
      extractCategoriesFromResponse({
        items: sampleCategories,
        categories: [{ id: 'other-1' }],
        data: [{ id: 'other-2' }],
      }),
    ).toEqual(sampleCategories);
  });

  it('falls back to categories and then data', () => {
    expect(
      extractCategoriesFromResponse({
        items: null,
        categories: sampleCategories,
      }),
    ).toEqual(sampleCategories);

    expect(
      extractCategoriesFromResponse({
        items: null,
        categories: null,
        data: sampleCategories,
      }),
    ).toEqual(sampleCategories);
  });

  it('returns empty array when all response collection keys are absent', () => {
    expect(extractCategoriesFromResponse({})).toEqual([]);
  });
});
