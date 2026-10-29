import { createEmptyProductFormVariation } from '../../../../../helpers/product-variation-mapping.helper';
import { ProductFormVariation } from '../../../models/product-form-variation.model';
import {
  assignVariationAttribute,
  updateVariationByLocalId,
} from './product-variation-state.helper';

describe('product-variation-state.helper', () => {
  it('updateVariationByLocalId updates only the matching variation', () => {
    const first = createEmptyProductFormVariation('a');
    const second = createEmptyProductFormVariation('b');

    const result = updateVariationByLocalId([first, second], 'b', (variation) => ({
      ...variation,
      title: 'Updated',
    }));

    expect(result[0]).toBe(first);
    expect(result[1].title).toBe('Updated');
  });

  describe('assignVariationAttribute', () => {
    const variation: ProductFormVariation = {
      ...createEmptyProductFormVariation('a'),
      attributeSearchValue: 'col',
      attributeSearchResults: [
        { id: 'attr-1', label: 'Color: Blue' },
        { id: 'attr-2', label: 'Size' },
      ],
    };

    it('adds the selected search result and clears the search', () => {
      expect(assignVariationAttribute(variation, 'attr-1')).toEqual({
        ...variation,
        attributes: [
          {
            id: 'attr-1',
            attributeTypeId: 'attr-1',
            name: 'Color',
            value: 'Blue',
            label: 'Color: Blue',
          },
        ],
        attributeSearchValue: '',
        attributeSearchResults: [],
      });
    });

    it('replaces an attribute that is already assigned', () => {
      const assigned: ProductFormVariation = {
        ...variation,
        attributes: [
          { id: 'attr-2', attributeTypeId: 'attr-2', name: 'Old', value: '', label: 'Old' },
        ],
      };

      expect(assignVariationAttribute(assigned, 'attr-2').attributes).toEqual([
        { id: 'attr-2', attributeTypeId: 'attr-2', name: 'Size', value: 'Size', label: 'Size' },
      ]);
    });

    it('returns the variation unchanged for unknown ids', () => {
      expect(assignVariationAttribute(variation, 'unknown')).toBe(variation);
    });
  });
});
