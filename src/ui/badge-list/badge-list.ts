import { Component, input } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { BadgeTone } from '@ui/badge/models/badge-tone.type';

/** Wrapping row of plain badges (tags, categories, attributes) with an empty-state line. */
@Component({
  selector: 'app-badge-list',
  imports: [Badge],
  templateUrl: './badge-list.html',
  styleUrl: './badge-list.scss',
})
export class BadgeList {
  public readonly labels = input.required<string[]>();
  public readonly tone = input<BadgeTone>('primary');
  /** Shown instead of the list when there are no labels; nothing is rendered when empty. */
  public readonly emptyText = input<string>('');
}
