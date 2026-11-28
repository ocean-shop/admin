import { ShareBarSegment } from '../../models/share-bar-segment.model';

export type ShareBarSegmentView = ShareBarSegment & {
  /** Width in percents, the sum of all widths never exceeds 100. */
  width: number;
};
