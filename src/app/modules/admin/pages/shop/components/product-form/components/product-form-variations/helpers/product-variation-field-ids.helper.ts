import { ProductFormVariationFieldIds } from '../../../models/product-form-variation-field-ids.model';

/** Unique DOM ids of one variation's fields: every prefix gets the variation local id appended. */
export const buildVariationFieldIds = (
  prefixes: ProductFormVariationFieldIds,
  localId: string,
): ProductFormVariationFieldIds =>
  Object.fromEntries(
    Object.entries(prefixes).map(([field, prefix]) => [field, `${prefix}${localId}`]),
  ) as ProductFormVariationFieldIds;
