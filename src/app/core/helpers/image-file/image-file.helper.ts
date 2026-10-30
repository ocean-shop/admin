import {
  IMAGE_DATA_URL_PREFIX,
  IMAGE_FILE_NAME_WHITESPACE_PATTERN,
  IMAGE_FILE_READ_ERROR,
  IMAGE_ID_RANDOM_PART_LENGTH,
  IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
  IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES,
} from '@core/constants/image-upload.constants';
import { ImageFileItem } from '@core/models/image-file-item.model';
import { ImageSortPayloadItem } from '@core/models/image-sort-payload-item.model';

/** Keeps allowed raster images within the size limit. */
export const filterAllowedImageFiles = (files: Iterable<File> | null | undefined): File[] =>
  Array.from(files ?? []).filter(
    (file) =>
      IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.type) &&
      file.size <= IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES,
  );

export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(IMAGE_FILE_READ_ERROR));
    reader.readAsDataURL(file);
  });

const createImageId = (prefix: string, file: File, index: number): string => {
  const randomPart = crypto.randomUUID().slice(0, IMAGE_ID_RANDOM_PART_LENGTH);
  const namePart =
    file.name.trim().replace(IMAGE_FILE_NAME_WHITESPACE_PATTERN, '-').toLowerCase() || prefix;
  return `${prefix}-${namePart}-${Date.now()}-${index}-${randomPart}`;
};

/** Reads files into list items; anything that is not an image data URL is dropped. */
export const mapFilesToImageItems = async (
  files: File[],
  prefix: string,
): Promise<ImageFileItem[]> => {
  const items = await Promise.all(
    files.map(async (file, index) => ({
      id: createImageId(prefix, file, index),
      name: file.name.trim() || `${prefix}-${Date.now()}-${index + 1}`,
      imageDataUrl: await readFileAsDataUrl(file),
    })),
  );

  return items.filter((item) => item.imageDataUrl.startsWith(IMAGE_DATA_URL_PREFIX));
};

/** API payload for an ordered image list: the list position becomes the `sort` value. */
export const mapImagesToSortPayload = (images: ImageFileItem[]): ImageSortPayloadItem[] =>
  images.map((image, index) => ({ image: image.imageDataUrl, sort: index }));
