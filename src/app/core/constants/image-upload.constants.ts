/**
 * Raster formats only: SVG is excluded on purpose because it can carry scripts
 * that run wherever the uploaded file is later rendered.
 */
export const IMAGE_UPLOAD_ALLOWED_MIME_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
];

export const IMAGE_UPLOAD_ACCEPT = IMAGE_UPLOAD_ALLOWED_MIME_TYPES.join(',');

export const IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const IMAGE_DATA_URL_PREFIX = 'data:image/';

export const IMAGE_ID_RANDOM_PART_LENGTH = 6;

export const IMAGE_FILE_NAME_WHITESPACE_PATTERN = /\s+/g;

export const IMAGE_FILE_READ_ERROR = 'Failed to read image file.';
