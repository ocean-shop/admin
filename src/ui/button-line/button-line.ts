import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonType } from '../button/models/button.type';

@Component({
  selector: 'app-button-line',
  imports: [],
  templateUrl: './button-line.html',
  styleUrl: './button-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonLine {
  label = input.required<string>();
  type = input<ButtonType>('button');
}
