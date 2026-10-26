import { SchemaPath } from '@angular/forms/signals';

export type SeoFormSchemaPaths = {
  metaTitle: SchemaPath<string>;
  metaDescription: SchemaPath<string>;
  canonicalUrl: SchemaPath<string>;
};

export type SeoValidationMessages = {
  META_TITLE_TOO_LONG: string;
  META_DESCRIPTION_TOO_LONG: string;
  CANONICAL_URL_INVALID: string;
};
