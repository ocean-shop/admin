import { ProductFormAttributeOption } from './product-form-attribute-option.model';
import { ProductFormVariationAttribute } from './product-form-variation-attribute.model';
import { ProductFormVariationImage } from './product-form-variation-image.model';

export type ProductFormVariation = {
  localId: string;
  id: string | null;
  title: string;
  name: string;
  price: string;
  oldPrice: string;
  sku: string;
  available: boolean;
  isMain: boolean;
  attributes: ProductFormVariationAttribute[];
  attributeSearchValue: string;
  attributeSearchResults: ProductFormAttributeOption[];
  isAttributeSearchLoading: boolean;
  images: ProductFormVariationImage[];
  isSaving: boolean;
};
