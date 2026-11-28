import { Component, input } from '@angular/core';
import { SectionCard } from '@ui/section-card/section-card';
import { InsightListItem } from './models/insight-list-item.model';

/** Card with short automatic conclusions, each marked with a tone icon. */
@Component({
  selector: 'app-insight-list',
  imports: [SectionCard],
  templateUrl: './insight-list.html',
  styleUrl: './insight-list.scss',
})
export class InsightList {
  public readonly title = input.required<string>();
  public readonly items = input.required<InsightListItem[]>();
  public readonly icon = input<string>('');
  public readonly description = input<string>('');
}
