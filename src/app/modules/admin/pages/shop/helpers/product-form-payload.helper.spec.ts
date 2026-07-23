import { ProductStatus } from '../pages/products/models/product-status.enum';
import { ProductType } from '../pages/products/models/product-type.enum';
import {
  buildCreateProductPayload,
  buildUpdateProductPayload,
} from './product-form-payload.helper';

describe('product-form-payload.helper', () => {
  const baseValues = {
    name: 'Coastal Shirt',
    type: ProductType.Simple,
    description: 'Soft linen',
    sku: 'SKU-1',
    status: ProductStatus.Active,
    available: true,
    price: '99.99',
    oldPrice: '129.99',
  };

  it('builds create payload with normalized shop id', () => {
    const payload = buildCreateProductPayload(' shop-1 ', baseValues);

    expect(payload).toEqual({
      shopId: 'shop-1',
      name: 'Coastal Shirt',
      type: ProductType.Simple,
      description: 'Soft linen',
      sku: 'SKU-1',
      status: ProductStatus.Active,
      available: true,
      price: 99.99,
      oldPrice: 129.99,
    });
  });

  it('returns null when name is empty', () => {
    const payload = buildUpdateProductPayload({
      ...baseValues,
      name: '   ',
    });

    expect(payload).toBeNull();
  });

  it('ignores invalid price values', () => {
    const payload = buildUpdateProductPayload({
      ...baseValues,
      price: '-1',
      oldPrice: 'oops',
    });

    expect(payload).toEqual({
      name: 'Coastal Shirt',
      type: ProductType.Simple,
      description: 'Soft linen',
      sku: 'SKU-1',
      status: ProductStatus.Active,
      available: true,
    });
  });
});
