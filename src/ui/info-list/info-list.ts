import { Component, input } from '@angular/core';
import { InfoListRow } from './models/info-list-row.model';

@Component({
  selector: 'app-info-list',
  templateUrl: './info-list.html',
  styleUrl: './info-list.scss',
})
export class InfoList {
  public readonly rows = input.required<InfoListRow[]>();
  public readonly monospace = input<boolean>(false);
}
