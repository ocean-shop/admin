import { SHARE_BAR_PERCENT } from '../../constants/share-bar.constants';
import { ShareBarSegment } from '../../models/share-bar-segment.model';
import { ShareBarSegmentView } from '../models/share-bar-segment-view.model';

const clampRatio = (value: number): number =>
  Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;

/** Segment widths in percents; together they never overflow the bar. */
export const buildShareBarSegments = (segments: ShareBarSegment[]): ShareBarSegmentView[] => {
  let used = 0;

  return segments.map((segment) => {
    const width = Math.min(clampRatio(segment.value) * SHARE_BAR_PERCENT, SHARE_BAR_PERCENT - used);
    used += width;
    return { ...segment, width };
  });
};
