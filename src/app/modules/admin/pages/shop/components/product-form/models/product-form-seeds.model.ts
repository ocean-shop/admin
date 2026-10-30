import { ProductFormAssignedAttribute } from './product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from './product-form-assigned-tag.model';
import { ProductFormImageItem } from './product-form-image-item.model';
import { ProductFormVariation } from './product-form-variation.model';

/** Initial state of the self-saving editor sections, taken from the loaded product. */
export type ProductFormSeeds = {
  categoryIds: Set<string>;
  attributes: ProductFormAssignedAttribute[];
  tags: ProductFormAssignedTag[];
  images: ProductFormImageItem[];
  variations: ProductFormVariation[];
};
