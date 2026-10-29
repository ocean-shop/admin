import {
  IMAGE_FILE_READ_ERROR,
  IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES,
} from '@core/constants/image-upload.constants';
import {
  filterAllowedImageFiles,
  mapFilesToImageItems,
  mapImagesToSortPayload,
  readFileAsDataUrl,
} from './image-file.helper';

const buildFile = (name: string, type: string, content = 'x'): File =>
  new File([content], name, { type });

describe('image-file.helper', () => {
  describe('filterAllowedImageFiles', () => {
    it('keeps raster images and drops svg, non-images and oversized files', () => {
      const png = buildFile('a.png', 'image/png');
      const jpeg = buildFile('b.jpg', 'image/jpeg');
      const svg = buildFile('c.svg', 'image/svg+xml');
      const text = buildFile('d.txt', 'text/plain');
      const huge = buildFile('e.png', 'image/png');
      Object.defineProperty(huge, 'size', { value: IMAGE_UPLOAD_MAX_FILE_SIZE_BYTES + 1 });

      expect(filterAllowedImageFiles([png, jpeg, svg, text, huge])).toEqual([png, jpeg]);
    });

    it('tolerates empty input', () => {
      expect(filterAllowedImageFiles(null)).toEqual([]);
      expect(filterAllowedImageFiles(undefined)).toEqual([]);
    });
  });

  describe('readFileAsDataUrl', () => {
    it('resolves a data URL', async () => {
      const result = await readFileAsDataUrl(buildFile('a.png', 'image/png', 'abc'));

      expect(result.startsWith('data:image/png')).toBe(true);
    });

    it('rejects when the reader fails', async () => {
      const originalReader = globalThis.FileReader;
      class FailingReader {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        readAsDataURL(): void {
          this.onerror?.();
        }
      }
      globalThis.FileReader = FailingReader as unknown as typeof FileReader;

      await expect(readFileAsDataUrl(buildFile('a.png', 'image/png'))).rejects.toThrow(
        IMAGE_FILE_READ_ERROR,
      );

      globalThis.FileReader = originalReader;
    });
  });

  describe('mapFilesToImageItems', () => {
    it('builds unique ids and keeps file names', async () => {
      const items = await mapFilesToImageItems(
        [buildFile('My Photo.png', 'image/png'), buildFile('b.png', 'image/png')],
        'image',
      );

      expect(items).toHaveLength(2);
      expect(items[0].id.startsWith('image-my-photo.png-')).toBe(true);
      expect(items[0].name).toBe('My Photo.png');
      expect(items[0].id).not.toBe(items[1].id);
    });

    it('generates a name for unnamed files and drops non-image data', async () => {
      const items = await mapFilesToImageItems(
        [buildFile(' ', 'image/png'), buildFile('a.txt', 'text/plain')],
        'variation-image',
      );

      expect(items).toHaveLength(1);
      expect(items[0].name.startsWith('variation-image-')).toBe(true);
    });
  });

  describe('mapImagesToSortPayload', () => {
    it('uses the list position as sort', () => {
      expect(
        mapImagesToSortPayload([
          { id: '1', name: 'a', imageDataUrl: 'data:image/png;a' },
          { id: '2', name: 'b', imageDataUrl: 'data:image/png;b' },
        ]),
      ).toEqual([
        { image: 'data:image/png;a', sort: 0 },
        { image: 'data:image/png;b', sort: 1 },
      ]);
    });
  });
});
