import { Component, input } from '@angular/core';
import { ButtonType } from '../button/models/button.type';

@Component({
  selector: 'app-button-line',
  templateUrl: './button-line.html',
  styleUrl: './button-line.scss',
})
export class ButtonLine {
  public readonly label = input.required<string>();
  public readonly type = input<ButtonType>('button');
}
