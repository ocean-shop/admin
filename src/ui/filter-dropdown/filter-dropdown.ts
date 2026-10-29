import { Component, input, output } from '@angular/core';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';

@Component({
  selector: 'app-filter-dropdown',
  imports: [Dropdown],
  templateUrl: './filter-dropdown.html',
  styleUrl: './filter-dropdown.scss',
})
export class FilterDropdown {
  public readonly label = input.required<string>();
  public readonly icon = input<string>();
  public readonly options = input.required<DropdownOption[]>();
  public readonly value = input<string>('');
  public readonly optionSelected = output<DropdownOption>();
}
