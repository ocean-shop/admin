import { maxLength, pattern } from '@angular/forms/signals';
import {
  SEO_CANONICAL_URL_MAX_LENGTH,
  SEO_CANONICAL_URL_PATTERN,
  SEO_META_DESCRIPTION_MAX_LENGTH,
  SEO_META_TITLE_MAX_LENGTH,
} from '../../constants/seo.constants';
import { SeoFormSchemaPaths, SeoValidationMessages } from '../../models/seo-form.model';

export const applySeoValidators = (
  schemaPath: SeoFormSchemaPaths,
  messages: SeoValidationMessages,
): void => {
  maxLength(schemaPath.metaTitle, SEO_META_TITLE_MAX_LENGTH, {
    message: messages.META_TITLE_TOO_LONG,
  });
  maxLength(schemaPath.metaDescription, SEO_META_DESCRIPTION_MAX_LENGTH, {
    message: messages.META_DESCRIPTION_TOO_LONG,
  });
  maxLength(schemaPath.canonicalUrl, SEO_CANONICAL_URL_MAX_LENGTH, {
    message: messages.CANONICAL_URL_INVALID,
  });
  pattern(schemaPath.canonicalUrl, SEO_CANONICAL_URL_PATTERN, {
    message: messages.CANONICAL_URL_INVALID,
  });
};

/** Trimmed value, or `null` so an emptied field clears the stored value on the API. */
export const toNullableSeoText = (value: string | null | undefined): string | null => {
  return value?.trim() || null;
};
