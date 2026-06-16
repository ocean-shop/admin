import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonType } from './models/button.type';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  label = input.required<string>();
  icon = input<string>();
  type = input<ButtonType>('button');
}
