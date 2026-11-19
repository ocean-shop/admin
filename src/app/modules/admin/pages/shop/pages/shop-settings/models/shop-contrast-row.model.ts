import { BadgeTone } from '@ui/badge/models/badge-tone.type';

export type ShopContrastRow = {
  label: string;
  foreground: string;
  background: string;
  ratioLabel: string;
  verdict: string;
  tone: BadgeTone;
};
