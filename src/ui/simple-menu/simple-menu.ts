import { Component, input, output } from '@angular/core';
import { SimpleMenuDivider, SimpleMenuEntry, SimpleMenuItem } from './models/simple-menu.type';

@Component({
  selector: 'app-simple-menu',
  templateUrl: './simple-menu.html',
  styleUrl: './simple-menu.scss',
})
export class SimpleMenu {
  items = input.required<SimpleMenuEntry[]>();

  itemSelected = output<SimpleMenuItem>();

  isDivider(entry: SimpleMenuEntry): entry is SimpleMenuDivider {
    return 'type' in entry && entry.type === 'divider';
  }

  selectItem(item: SimpleMenuItem, event: Event) {
    event.preventDefault();
    this.itemSelected.emit(item);
  }
}
