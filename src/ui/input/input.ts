import { Component, input, output, computed } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { InputType } from './models/input.type';

@Component({
  selector: 'app-input',
  imports: [FormField],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class Input {
  public readonly id = input.required<string>();
  public readonly type = input<InputType>('text');
  public readonly placeholder = input<string>('');
  public readonly label = input<string>('');
  public readonly icon = input<string>('');
  public readonly value = input<string>('');
  public readonly disabled = input<boolean>(false);
  public readonly control = input<any>();
  public readonly focusEvent = output<FocusEvent>();
  public readonly blurEvent = output<FocusEvent>();
  public readonly valueChange = output<string>();
  public readonly errorMessage = computed(() => {
    const fieldFn = this.control();
    if (!fieldFn) return '';

    const state = fieldFn();
    if (state.touched() && state.invalid()) {
      const errors = state.errors();
      return errors && errors.length > 0 ? errors[0].message : '';
    }
    return '';
  });

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
