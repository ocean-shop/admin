import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { InputType } from './models/input.type';

@Component({
  selector: 'app-input',
  imports: [FormField],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Input {
  id = input.required<string>();
  type = input<InputType>('text');
  placeholder = input<string>('');
  label = input<string>('');
  icon = input<string>('');

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
