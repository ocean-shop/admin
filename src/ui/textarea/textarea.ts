import { Component, computed, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-textarea',
  imports: [FormField],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
})
export class Textarea {
  public readonly id = input.required<string>();
  public readonly placeholder = input<string>('');
  public readonly label = input<string>('');
  public readonly rows = input<number>(4);
  public readonly control = input.required<any>();
  public readonly focusEvent = output<FocusEvent>();
  public readonly blurEvent = output<FocusEvent>();
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
}
