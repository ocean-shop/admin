import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-textarea',
  imports: [FormField],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Textarea {
  id = input.required<string>();
  placeholder = input<string>('');
  label = input<string>('');
  rows = input<number>(4);

  control = input.required<any>();

  focusEvent = output<FocusEvent>();
  blurEvent = output<FocusEvent>();

  errorMessage = computed(() => {
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
