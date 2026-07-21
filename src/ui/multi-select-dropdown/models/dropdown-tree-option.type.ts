import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

export type DropdownTreeOption = DropdownOption & {
  level: number;
};
