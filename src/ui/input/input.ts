import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { InputType } from './models/input.type';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  id = input.required<string>();
  name = input.required<string>();
  type = input<InputType>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);

  focusEvent = output<FocusEvent>();
  blurEvent = output<FocusEvent>();
}
