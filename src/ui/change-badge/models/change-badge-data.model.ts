import { ChangeDirection } from './change-direction.type';
import { ChangeTone } from './change-tone.type';

/** Everything a change badge needs, so features can pass one value around. */
export type ChangeBadgeData = {
  label: string;
  direction: ChangeDirection;
  tone: ChangeTone;
};
