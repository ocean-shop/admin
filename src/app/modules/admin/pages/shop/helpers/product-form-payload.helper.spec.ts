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
    isPopular: false,
    isMainBanner: false,
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
      isMainBanner: false,
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
      isMainBanner: false,
    });
  });

  it('includes isPopular in the payload when checked', () => {
    const payload = buildUpdateProductPayload({
      ...baseValues,
      isPopular: true,
    });

    expect(payload).toEqual({
      name: 'Coastal Shirt',
      type: ProductType.Simple,
      description: 'Soft linen',
      sku: 'SKU-1',
      status: ProductStatus.Active,
      available: true,
      isMainBanner: false,
      isPopular: true,
      price: 99.99,
      oldPrice: 129.99,
    });
  });

  it('omits isPopular from the payload when not checked', () => {
    const payload = buildUpdateProductPayload(baseValues);

    expect(payload).not.toHaveProperty('isPopular');
  });

  it('always includes isMainBanner in the payload', () => {
    expect(buildUpdateProductPayload({ ...baseValues, isMainBanner: true })).toHaveProperty(
      'isMainBanner',
      true,
    );
    expect(buildUpdateProductPayload(baseValues)).toHaveProperty('isMainBanner', false);
  });
});
