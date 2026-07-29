import { ProductAttributesToastTexts } from '../components/product-form-attributes/models/product-attributes-toast-texts.model';
import { ProductCategoriesToastTexts } from '../components/product-form-categories/models/product-categories-toast-texts.model';
import { ProductImagesToastTexts } from '../components/product-form-images/models/product-images-toast-texts.model';
import { ProductTagsToastTexts } from '../components/product-form-tags/models/product-tags-toast-texts.model';
import { ProductVariationsToastTexts } from '../components/product-form-variations/models/product-variations-toast-texts.model';

export type ProductFormToastTexts = ProductCategoriesToastTexts &
  ProductTagsToastTexts &
  ProductAttributesToastTexts &
  ProductImagesToastTexts &
  ProductVariationsToastTexts;
