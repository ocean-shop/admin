import { Component, input, output } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { TabItem } from './models/tab-item.model';

/** Underlined horizontal tabs; the parent owns the selected value. */
@Component({
  selector: 'app-tabs',
  imports: [Badge],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {
  public readonly items = input.required<TabItem[]>();
  public readonly selectedValue = input<string | null>(null);
  public readonly ariaLabel = input<string>('');
  public readonly valueChange = output<string>();

  protected onSelect(value: string): void {
    if (value !== this.selectedValue()) {
      this.valueChange.emit(value);
    }
  }
}
