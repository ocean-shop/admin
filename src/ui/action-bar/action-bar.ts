import { Component, input } from '@angular/core';
import { ActionBarTone } from './models/action-bar-tone.type';

/** Sticky bottom bar with a status line and projected actions (e.g. "Скасувати" / "Зберегти"). */
@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.html',
  styleUrl: './action-bar.scss',
})
export class ActionBar {
  public readonly message = input<string>('');
  /** Material Symbols name shown before the message. */
  public readonly icon = input<string>('');
  public readonly tone = input<ActionBarTone>('default');
}
