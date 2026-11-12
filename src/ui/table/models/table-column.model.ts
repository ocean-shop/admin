import { BadgeTone } from '@ui/badge/models/badge-tone.type';

export type TableCellAlign = 'left' | 'center' | 'right';

export type TableColumn = {
  key: string;
  header: string;
  align?: TableCellAlign;
  width?: string;
  fallback?: string;
  /** Renders the cell as a Badge; the tone is looked up by the cell's text value. */
  badgeTones?: Record<string, BadgeTone>;
  /** Primary cell — rendered with medium weight (names, numbers). */
  emphasis?: boolean;
  /** Technical value (ids, slugs, SKU) — rendered in the mono family. */
  mono?: boolean;
  /** Row key holding an image URL shown as a thumbnail before the value (placeholder when empty). */
  thumbnailKey?: string;
};

export type TableRowData = Record<string, unknown>;
