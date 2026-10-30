import {
  CATEGORIES_DEFAULT_NAME,
  CATEGORIES_DEFAULT_SLUG,
} from '../../constants/categories.constants';
import { Category } from '../../models/category.model';
import {
  buildCategoryTree,
  flattenVisibleCategoryNodes,
  mapCategory,
  resolveCategoriesStats,
} from './category-mapping.helper';

const category = (id: string, sort: number, parentId?: string): Category => ({
  id,
  name: id.toUpperCase(),
  slug: id,
  sort,
  ...(parentId ? { parentId } : {}),
});

describe('category-mapping.helper', () => {
  describe('mapCategory', () => {
    it('maps every supported field', () => {
      expect(
        mapCategory({
          id: 7,
          parentId: 3,
          name: ' Shoes ',
          slug: ' shoes ',
          sort: 2,
          productCount: 4,
          metaTitle: 'T',
          metaDescription: 'D',
          canonicalUrl: 'https://x.dev',
          noIndex: true,
        }),
      ).toEqual({
        id: '7',
        parentId: '3',
        name: 'Shoes',
        slug: 'shoes',
        sort: 2,
        productCount: 4,
        metaTitle: 'T',
        metaDescription: 'D',
        canonicalUrl: 'https://x.dev',
        noIndex: true,
      });
    });

    it('applies fallbacks and alternative count fields', () => {
      const mapped = mapCategory({ name: '', slug: null, productsCount: 5, noIndex: false });

      expect(mapped.id).toBeTruthy();
      expect(mapped.name).toBe(CATEGORIES_DEFAULT_NAME);
      expect(mapped.slug).toBe(CATEGORIES_DEFAULT_SLUG);
      expect(mapped.sort).toBe(0);
      expect(mapped.productCount).toBe(5);
      expect(mapped).not.toHaveProperty('noIndex');
      expect(mapped).not.toHaveProperty('parentId');
      expect(mapCategory({ itemsCount: 1 }).productCount).toBe(1);
      expect(mapCategory({})).not.toHaveProperty('productCount');
    });
  });

  it('resolveCategoriesStats reads only numeric stats from envelopes', () => {
    expect(resolveCategoriesStats(undefined)).toEqual({});
    expect(resolveCategoriesStats([])).toEqual({});
    expect(resolveCategoriesStats({ totalCategories: 2, deepestLevel: 3 })).toEqual({
      totalCategories: 2,
      deepestLevel: 3,
    });
    expect(resolveCategoriesStats({ totalCategories: 1 })).toEqual({ totalCategories: 1 });
    expect(resolveCategoriesStats({ deepestLevel: 4 })).toEqual({ deepestLevel: 4 });
  });

  describe('tree', () => {
    const categories = [
      category('b', 1),
      category('a', 0),
      category('c', 1),
      category('a1', 0, 'a'),
      category('a2', 1, 'a'),
    ];

    it('orders siblings by sort, then by id', () => {
      const tree = buildCategoryTree(categories);

      expect(tree.map((node) => node.category.id)).toEqual(['a', 'b', 'c']);
      expect(tree[0].children.map((node) => node.category.id)).toEqual(['a1', 'a2']);
    });

    it('hides children of collapsed nodes', () => {
      const nodes = flattenVisibleCategoryNodes(buildCategoryTree(categories), new Set(['a']));

      expect(nodes.map((node) => node.category.id)).toEqual(['a', 'b', 'c']);
      expect(nodes[0]).toMatchObject({
        depth: 0,
        hasChildren: true,
        isExpanded: false,
        canMoveUp: false,
        canMoveDown: true,
      });
      expect(nodes[2]).toMatchObject({ canMoveUp: true, canMoveDown: false });
    });

    it('expands every node by default and shows children with depth', () => {
      const nodes = flattenVisibleCategoryNodes(buildCategoryTree(categories), new Set());

      expect(nodes[0].isExpanded).toBe(true);
      expect(nodes.map((node) => [node.category.id, node.depth])).toEqual([
        ['a', 0],
        ['a1', 1],
        ['a2', 1],
        ['b', 0],
        ['c', 0],
      ]);
    });

    it('never renders a node twice', () => {
      const duplicated = { category: category('x', 0), children: [] };

      const nodes = flattenVisibleCategoryNodes([duplicated, duplicated], new Set());

      expect(nodes).toHaveLength(1);
    });
  });
});
