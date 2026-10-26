// Limits and patterns mirror the API DTO validation for SEO fields.
export const SEO_SLUG_MAX_LENGTH = 255;
export const SEO_META_TITLE_MAX_LENGTH = 255;
export const SEO_META_DESCRIPTION_MAX_LENGTH = 500;
export const SEO_CANONICAL_URL_MAX_LENGTH = 500;

/** Empty, or lowercase latin words joined by single hyphens, e.g. `wetsuit-5-mm`. */
export const SEO_SLUG_PATTERN = /^(|[a-z0-9]+(?:-[a-z0-9]+)*)$/;

/** Empty, or an absolute http(s) URL. */
export const SEO_CANONICAL_URL_PATTERN = /^(|https?:\/\/\S+)$/i;
