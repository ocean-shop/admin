import { Component, input, output } from '@angular/core';
import { ChipVariant } from './models/chip-variant.type';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
})
export class Chip {
  public readonly label = input.required<string>();
  public readonly removeAriaLabel = input.required<string>();
  public readonly variant = input<ChipVariant>('attribute');
  public readonly disabled = input<boolean>(false);
  public readonly remove = output<void>();

  protected onRemoveClick(): void {
    if (this.disabled()) {
      return;
    }

    this.remove.emit();
  }
}
