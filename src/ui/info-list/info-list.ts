import { Component, input } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { InfoListLayout } from './models/info-list-layout.type';
import { InfoListRow } from './models/info-list-row.model';
import { InfoListValueAlign } from './models/info-list-value-align.type';

@Component({
  selector: 'app-info-list',
  imports: [Badge],
  templateUrl: './info-list.html',
  styleUrl: './info-list.scss',
})
export class InfoList {
  public readonly rows = input.required<InfoListRow[]>();
  public readonly monospace = input<boolean>(false);
  public readonly layout = input<InfoListLayout>('grid');
  /** Value alignment in the `rows` layout (e.g. right-aligned amounts). */
  public readonly valueAlign = input<InfoListValueAlign>('left');
}
