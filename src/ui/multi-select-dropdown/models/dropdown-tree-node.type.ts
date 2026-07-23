import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

export type DropdownTreeNode = {
  option: DropdownOption;
  children: DropdownTreeNode[];
};
