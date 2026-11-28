import { ShareBarTone } from './share-bar-tone.type';

export type ShareBarSegment = {
  /** Share of the whole bar, 0..1. */
  value: number;
  tone: ShareBarTone;
  /** Caption drawn inside the segment of a large bar. */
  label?: string;
};
