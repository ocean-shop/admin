import { InsightTone } from './insight-tone.type';

export type InsightListItem = {
  /** Stable id used for tracking. */
  id: string;
  /** Material Symbols name. */
  icon: string;
  tone: InsightTone;
  message: string;
};
