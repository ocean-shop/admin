import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonType } from './models/button.type';
import { ButtonVariant } from './models/button-variant.type';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Button {
  readonly label = input.required<string>();
  readonly icon = input<string>();
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly iconLeading = input<boolean>(false);
  readonly fullWidth = input<boolean>(true);
  readonly variant = input<ButtonVariant>('primary');
}
