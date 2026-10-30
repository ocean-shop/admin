import { ProductFormSeeds } from '../../components/product-form/models/product-form-seeds.model';
import { ProductApiItem } from '../../pages/products/models/product.model';
import {
  extractProductAttributes,
  extractProductCategoryIds,
  extractProductImages,
  extractProductTags,
} from '../product-api-mapping/product-api-mapping.helper';
import { extractProductVariations } from '../product-variation-mapping/product-variation-mapping.helper';

/** Editor section seeds of a loaded product; everything is empty while there is no product. */
export const buildProductFormSeeds = (
  product: ProductApiItem | null | undefined,
): ProductFormSeeds =>
  product
    ? {
        categoryIds: extractProductCategoryIds(product),
        attributes: extractProductAttributes(product),
        tags: extractProductTags(product),
        images: extractProductImages(product),
        variations: extractProductVariations(product),
      }
    : { categoryIds: new Set(), attributes: [], tags: [], images: [], variations: [] };
