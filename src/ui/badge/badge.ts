import { Component, input } from '@angular/core';
import { BadgeTone } from './models/badge-tone.type';

/** Status pill: tone is always paired with a word, colour is never the only signal. */
@Component({
  selector: 'app-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  public readonly label = input.required<string>();
  public readonly tone = input<BadgeTone>('neutral');
  /** Hides the leading dot (roles, counters, dates). */
  public readonly plain = input<boolean>(false);
}
