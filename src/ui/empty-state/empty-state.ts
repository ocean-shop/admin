import { Component, input } from '@angular/core';
import { EMPTY_STATE_DEFAULT_ICON } from './constants/empty-state.constants';

/** Centered placeholder for empty lists: icon, title, one sentence and an optional action. */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  public readonly title = input.required<string>();
  public readonly text = input<string>('');
  public readonly icon = input<string>(EMPTY_STATE_DEFAULT_ICON);
}
