import { maxLength, pattern, required, SchemaPathTree } from '@angular/forms/signals';
import { PRODUCT_FORM_TEXTS } from '../../components/product-form/constants/product-form.constants';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { SEO_SLUG_MAX_LENGTH, SEO_SLUG_PATTERN } from '../../constants/seo.constants';
import { applySeoValidators } from '../seo-form/seo-form.helper';

export const applyProductSeoValidators = (schemaPath: SchemaPathTree<ProductFormModel>): void => {
  maxLength(schemaPath.slug, SEO_SLUG_MAX_LENGTH, { message: PRODUCT_FORM_TEXTS.SLUG_INVALID });
  pattern(schemaPath.slug, SEO_SLUG_PATTERN, { message: PRODUCT_FORM_TEXTS.SLUG_INVALID });
  applySeoValidators(schemaPath, PRODUCT_FORM_TEXTS);
};

/** Full product form schema: required name plus the SEO rules. */
export const applyProductFormValidators = (schemaPath: SchemaPathTree<ProductFormModel>): void => {
  required(schemaPath.name, { message: PRODUCT_FORM_TEXTS.PRODUCT_NAME_REQUIRED });
  applyProductSeoValidators(schemaPath);
};
