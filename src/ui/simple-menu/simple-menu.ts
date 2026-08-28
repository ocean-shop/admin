import { Component, input, output } from '@angular/core';
import { SimpleMenuDivider, SimpleMenuEntry, SimpleMenuItem } from './models/simple-menu.type';

@Component({
  selector: 'app-simple-menu',
  templateUrl: './simple-menu.html',
  styleUrl: './simple-menu.scss',
})
export class SimpleMenu {
  public readonly items = input.required<SimpleMenuEntry[]>();
  public readonly itemSelected = output<SimpleMenuItem>();

  protected isDivider(entry: SimpleMenuEntry): entry is SimpleMenuDivider {
    return 'type' in entry && entry.type === 'divider';
  }

  protected selectItem(item: SimpleMenuItem, event: Event): void {
    event.preventDefault();
    this.itemSelected.emit(item);
  }
}
