import { Component, input } from '@angular/core';
import { ButtonType } from './models/button.type';
import { ButtonVariant } from './models/button-variant.type';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  public readonly label = input.required<string>();
  public readonly icon = input<string>();
  public readonly type = input<ButtonType>('button');
  public readonly disabled = input<boolean>(false);
  public readonly iconLeading = input<boolean>(false);
  public readonly fullWidth = input<boolean>(true);
  public readonly variant = input<ButtonVariant>('primary');
}
