import { createEmptyProductFormVariation } from '../../../../../../helpers/product-variation-mapping/product-variation-mapping.helper';
import { PRODUCT_FORM_VARIATION_PAYLOAD_KIND } from '../../../../constants/product-form.constants';
import { ProductFormVariation } from '../../../../models/product-form-variation.model';
import {
  buildCreateVariationPayload,
  buildUpdateVariationPayload,
  resolveSavedVariationId,
} from './product-variation-payload.helper';

const UUID = '11111111-1111-4111-8111-111111111111';

const buildVariation = (overrides: Partial<ProductFormVariation> = {}): ProductFormVariation => ({
  ...createEmptyProductFormVariation('local-1'),
  ...overrides,
});

describe('product-variation-payload.helper', () => {
  const variation = buildVariation({
    title: ' Title ',
    name: ' Name ',
    sku: ' SKU-1 ',
    price: '10.50',
    oldPrice: '',
    available: false,
    isMain: true,
    attributes: [
      {
        id: UUID,
        attributeTypeId: ` ${UUID} `,
        name: 'Color',
        value: 'Blue',
        label: 'Color: Blue',
      },
      { id: 'local', attributeTypeId: 'local', name: 'X', value: '', label: 'X' },
    ],
    images: [{ id: 'img-1', name: 'a', imageDataUrl: 'data:image/png;a' }],
  });

  it('builds the update payload with trimmed fields, UUID attributes and sorted images', () => {
    expect(buildUpdateVariationPayload(variation)).toEqual({
      title: 'Title',
      name: 'Name',
      sku: 'SKU-1',
      price: 10.5,
      oldPrice: null,
      available: false,
      isDefault: true,
      attributes: [{ attributeTypeId: UUID }],
      images: [{ image: 'data:image/png;a', sort: 0 }],
    });
  });

  it('builds the create payload with the variation marker', () => {
    expect(buildCreateVariationPayload(variation)).toEqual({
      variation: PRODUCT_FORM_VARIATION_PAYLOAD_KIND,
      ...buildUpdateVariationPayload(variation),
    });
  });

  it('omits empty text fields and an unparsable price', () => {
    const payload = buildUpdateVariationPayload(buildVariation({ price: 'abc' }));

    expect(payload.title).toBeUndefined();
    expect(payload.name).toBeUndefined();
    expect(payload.sku).toBeUndefined();
    expect('price' in payload).toBe(false);
  });

  describe('resolveSavedVariationId', () => {
    it('matches by id first', () => {
      expect(
        resolveSavedVariationId(
          [{ id: 'var-1', sku: 'SKU-1' }, { id: 'var-2' }],
          buildVariation({ id: 'var-2', sku: 'SKU-1' }),
        ),
      ).toBe('var-2');
    });

    it('matches by SKU when the id is unknown', () => {
      expect(
        resolveSavedVariationId(
          [
            { id: 'var-1', sku: 'SKU-1' },
            { id: 'var-2', sku: 'SKU-2' },
          ],
          buildVariation({ sku: ' SKU-1 ' }),
        ),
      ).toBe('var-1');
    });

    it('falls back to the last variation, also when it is a bare id', () => {
      expect(resolveSavedVariationId([{ id: 'var-1' }, ' var-2 '], buildVariation())).toBe('var-2');
    });

    it('returns null when nothing can be resolved', () => {
      expect(resolveSavedVariationId([], buildVariation())).toBeNull();
      expect(resolveSavedVariationId([{ id: null }], buildVariation())).toBeNull();
    });
  });
});
