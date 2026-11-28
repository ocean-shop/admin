import { Component, input } from '@angular/core';
import { ChangeBadge } from '@ui/change-badge/change-badge';
import { ChangeBadgeData } from '@ui/change-badge/models/change-badge-data.model';

/** Metric tile: label + icon on top, large tabular value, optional change and helper lines. */
@Component({
  selector: 'app-stat-card',
  imports: [ChangeBadge],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  public readonly label = input.required<string>();
  public readonly value = input.required<string | number>();
  public readonly icon = input<string>('');
  public readonly helper = input<string>('');
  /** Change vs a previous period, shown as a badge under the value. */
  public readonly change = input<ChangeBadgeData | null>(null);
  /** Caption next to the change, e.g. «було 230 100 ₴». */
  public readonly previous = input<string>('');
}
