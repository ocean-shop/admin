import { Component, input } from '@angular/core';
import { StateMessageTone } from './models/state-message-tone.type';

/** Inline status text for empty / loading / error states. */
@Component({
  selector: 'app-state-message',
  templateUrl: './state-message.html',
  styleUrl: './state-message.scss',
})
export class StateMessage {
  public readonly message = input.required<string>();
  public readonly tone = input<StateMessageTone>('default');
}
