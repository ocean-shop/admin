import { PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES } from '../../../constants/product-form.constants';
import { buildVariationFieldIds } from './product-variation-field-ids.helper';

describe('product-variation-field-ids.helper', () => {
  it('appends the local id to every prefix', () => {
    const ids = buildVariationFieldIds(PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES, 'local-1');

    expect(Object.keys(ids)).toEqual(Object.keys(PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES));
    expect(ids.TITLE).toBe(`${PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES.TITLE}local-1`);
    expect(ids.ATTRIBUTE_SEARCH).toBe(
      `${PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES.ATTRIBUTE_SEARCH}local-1`,
    );
  });
});
