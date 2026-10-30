import { parseAttributeLabel } from '../../../../../../helpers/attribute-label/attribute-label.helper';
import { ProductFormVariation } from '../../../../models/product-form-variation.model';

/** Immutable update of the variation with the given local id; others are returned as-is. */
export const updateVariationByLocalId = (
  variations: ProductFormVariation[],
  localId: string,
  update: (variation: ProductFormVariation) => ProductFormVariation,
): ProductFormVariation[] =>
  variations.map((variation) => (variation.localId === localId ? update(variation) : variation));

/** Moves a search result into the variation attributes (replacing a same-id one) and clears the search. */
export const assignVariationAttribute = (
  variation: ProductFormVariation,
  attributeId: string,
): ProductFormVariation => {
  const option = variation.attributeSearchResults.find((result) => result.id === attributeId);
  if (!option) {
    return variation;
  }

  const attribute = {
    id: attributeId,
    attributeTypeId: attributeId,
    ...parseAttributeLabel(option.label),
    label: option.label,
  };
  const isAssigned = variation.attributes.some((item) => item.id === attributeId);

  return {
    ...variation,
    attributes: isAssigned
      ? variation.attributes.map((item) => (item.id === attributeId ? attribute : item))
      : [...variation.attributes, attribute],
    attributeSearchValue: '',
    attributeSearchResults: [],
  };
};
