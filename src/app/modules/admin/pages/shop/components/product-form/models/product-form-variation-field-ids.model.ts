import { PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES } from '../constants/product-form.constants';

export type ProductFormVariationFieldIds = Record<
  keyof typeof PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES,
  string
>;
