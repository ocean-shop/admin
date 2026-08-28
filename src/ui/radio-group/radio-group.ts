import { Component, input, output } from '@angular/core';
import { RadioGroupOption } from './models/radio-group-option.model';

@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.scss',
})
export class RadioGroup {
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly options = input.required<RadioGroupOption[]>();
  readonly selectedValue = input<string | number | boolean | null>(null);
  readonly disabled = input<boolean>(false);

  readonly valueChange = output<string | number | boolean>();

  protected onOptionChange(value: string | number | boolean): void {
    this.valueChange.emit(value);
  }
}
