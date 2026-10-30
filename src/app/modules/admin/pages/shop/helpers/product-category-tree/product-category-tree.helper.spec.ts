import { PRODUCT_FALLBACK_LABELS } from '../../constants/product-fallback-labels.constants';
import {
  buildProductCategoryTreeNodes,
  updateSelectedCategoryIds,
} from './product-category-tree.helper';

describe('product-category-tree.helper', () => {
  describe('buildProductCategoryTreeNodes', () => {
    it('builds nested tree sorted by label with checked state', () => {
      const tree = buildProductCategoryTreeNodes(
        [
          { id: 'c2', name: 'Shoes' },
          { id: 'c1', name: 'Bags' },
          { id: 'c3', name: 'Sneakers', parentId: 'c2' },
        ],
        new Set(['c3']),
      );

      expect(tree).toEqual([
        { id: 'c1', label: 'Bags', checked: false },
        {
          id: 'c2',
          label: 'Shoes',
          checked: false,
          children: [{ id: 'c3', label: 'Sneakers', checked: true }],
        },
      ]);
    });

    it('skips categories without id and uses fallback label', () => {
      const tree = buildProductCategoryTreeNodes(
        [{ id: '' }, { id: ' c1 ', name: '  ' }],
        new Set(),
      );

      expect(tree).toEqual([
        { id: 'c1', label: `${PRODUCT_FALLBACK_LABELS.CATEGORY_PREFIX} c1`, checked: false },
      ]);
    });

    it('ignores self-referencing parent id', () => {
      const tree = buildProductCategoryTreeNodes(
        [{ id: 'c1', name: 'Root', parentId: 'c1' }],
        new Set(),
      );

      expect(tree).toEqual([{ id: 'c1', label: 'Root', checked: false }]);
    });

    it('marks nodes as disabled when option is set', () => {
      const tree = buildProductCategoryTreeNodes([{ id: 'c1', name: 'Root' }], new Set(), {
        disabled: true,
      });

      expect(tree[0].disabled).toBe(true);
    });
  });

  describe('updateSelectedCategoryIds', () => {
    it('adds id when checked without mutating the source set', () => {
      const source = new Set(['a']);

      const result = updateSelectedCategoryIds(source, 'b', true);

      expect([...result]).toEqual(['a', 'b']);
      expect([...source]).toEqual(['a']);
    });

    it('removes id when unchecked', () => {
      const result = updateSelectedCategoryIds(new Set(['a', 'b']), 'a', false);

      expect([...result]).toEqual(['b']);
    });
  });
});
