import { DropdownOption } from '../models/dropdown.type';

/** Narrows a raw dropdown value to the option union it was built from. */
export const isDropdownOptionValue = <T extends string>(
  value: string,
  options: readonly DropdownOption[],
): value is T => options.some((option) => option.value === value);
