import { PRODUCT_ATTRIBUTE_LABEL_SEPARATOR } from '../../constants/product-api-mapping.constants';
import { AttributeLabelParts } from '../../models/attribute-label-parts.model';

/** "Name: Value", or just the name when there is no value. */
export const formatAttributeLabel = (name: string, value: string): string =>
  value ? `${name}${PRODUCT_ATTRIBUTE_LABEL_SEPARATOR} ${value}` : name;

/** Splits "Name: Value" back into parts; a part that is missing falls back to the whole label. */
export const parseAttributeLabel = (label: string): AttributeLabelParts => {
  const [namePart, ...valueParts] = label.split(PRODUCT_ATTRIBUTE_LABEL_SEPARATOR);
  const fullLabel = label.trim();

  return {
    name: namePart.trim() || fullLabel,
    value: valueParts.join(PRODUCT_ATTRIBUTE_LABEL_SEPARATOR).trim() || fullLabel,
  };
};
