import { Component, input, output } from '@angular/core';
import { RadioGroupOption } from './models/radio-group-option.model';

@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.scss',
})
export class RadioGroup {
  public readonly name = input.required<string>();
  public readonly label = input<string>('');
  public readonly options = input.required<RadioGroupOption[]>();
  public readonly selectedValue = input<string | number | boolean | null>(null);
  public readonly disabled = input<boolean>(false);
  public readonly valueChange = output<string | number | boolean>();

  protected onOptionChange(value: string | number | boolean): void {
    this.valueChange.emit(value);
  }
}
