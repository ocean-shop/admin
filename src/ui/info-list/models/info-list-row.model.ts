import { BadgeTone } from '@ui/badge/models/badge-tone.type';

export type InfoListRow = {
  label: string;
  value: string;
  /** Renders the value as a Badge with this tone. */
  tone?: BadgeTone;
  /** Technical value (ids, numbers) — rendered in the mono family. */
  mono?: boolean;
  /** Highlighted row (e.g. a grand total). */
  emphasis?: boolean;
};
