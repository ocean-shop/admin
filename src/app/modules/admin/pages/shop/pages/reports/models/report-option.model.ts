import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';

/** Segmented-control option with a typed value. */
export type ReportOption<T extends string | number> = RadioGroupOption & {
  value: T;
};
