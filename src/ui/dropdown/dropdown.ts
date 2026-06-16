import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DropdownOption } from './models/dropdown.type';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dropdown {
  label = input.required<string>();
  icon = input<string>();
  options = input.required<DropdownOption[]>();

  optionSelected = output<DropdownOption>();

  selectOption(option: DropdownOption, event: Event) {
    event.preventDefault();
    this.optionSelected.emit(option);
  }
}
