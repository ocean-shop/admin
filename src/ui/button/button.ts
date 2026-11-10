import { Component, input } from '@angular/core';
import { ButtonType } from './models/button.type';
import { ButtonVariant } from './models/button-variant.type';
import { ButtonSize } from './models/button-size.type';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    '[class.admin-btn-host-full]': 'fullWidth()',
  },
})
export class Button {
  public readonly label = input.required<string>();
  public readonly icon = input<string>();
  public readonly type = input<ButtonType>('button');
  public readonly disabled = input<boolean>(false);
  public readonly loading = input<boolean>(false);
  public readonly iconLeading = input<boolean>(false);
  public readonly fullWidth = input<boolean>(true);
  public readonly variant = input<ButtonVariant>('primary');
  public readonly size = input<ButtonSize>('md');
}
