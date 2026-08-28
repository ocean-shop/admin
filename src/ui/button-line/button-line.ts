import { Component, input } from '@angular/core';
import { ButtonType } from '../button/models/button.type';

@Component({
  selector: 'app-button-line',
  templateUrl: './button-line.html',
  styleUrl: './button-line.scss',
})
export class ButtonLine {
  label = input.required<string>();
  type = input<ButtonType>('button');
}
